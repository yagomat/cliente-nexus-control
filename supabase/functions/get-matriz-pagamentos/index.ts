import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabaseClient {
  id: string;
  nome: string;
  dia_vencimento: number;
  ativo: boolean;
  deleted_at: string | null;
}

interface DatabasePagamento {
  id: string;
  cliente_id: string;
  mes: number;
  ano: number;
  status: string;
}

interface MatrizItem {
  clienteId: string;
  clienteNome: string;
  pagamentos: Record<number, { status: string; id?: string } | null>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      ano = new Date().getFullYear(),
      search = '',
      status = 'todos',
      page = 1,
      itemsPerPage = 10 
    } = await req.json();

    console.log(`Processing matriz request: ano=${ano}, search="${search}", status="${status}", page=${page}, itemsPerPage=${itemsPerPage}`);

    // Buscar clientes do usuário
    let clientesQuery = supabase
      .from('clientes')
      .select('id, nome, dia_vencimento, ativo, deleted_at')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    // Aplicar filtro de status
    if (status !== 'todos') {
      if (status === 'ativo') {
        clientesQuery = clientesQuery.eq('ativo', true);
      } else if (status === 'inativo') {
        clientesQuery = clientesQuery.eq('ativo', false);
      }
    } else {
      // Para "todos", incluir apenas ativos (comportamento padrão)
      clientesQuery = clientesQuery.eq('ativo', true);
    }

    if (search.trim()) {
      clientesQuery = clientesQuery.ilike('nome', `%${search.trim()}%`);
    }

    const { data: clientes, error: clientesError } = await clientesQuery;
    
    if (clientesError) {
      console.error('Error fetching clients:', clientesError);
      throw clientesError;
    }

    const clientesTyped = clientes as DatabaseClient[];
    console.log(`Found ${clientesTyped.length} clients`);

    if (clientesTyped.length === 0) {
      return new Response(JSON.stringify({
        matriz: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: page,
          itemsPerPage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar todos os pagamentos do ano para os clientes encontrados
    const clienteIds = clientesTyped.map(c => c.id);
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('id, cliente_id, mes, ano, status')
      .eq('user_id', user.id)
      .eq('ano', ano)
      .in('cliente_id', clienteIds);

    if (pagamentosError) {
      console.error('Error fetching payments:', pagamentosError);
      throw pagamentosError;
    }

    const pagamentosTyped = pagamentos as DatabasePagamento[];
    console.log(`Found ${pagamentosTyped.length} payments for year ${ano}`);

    // Criar mapa de pagamentos para acesso rápido
    const pagamentosMap = new Map<string, DatabasePagamento>();
    pagamentosTyped.forEach(pag => {
      const key = `${pag.cliente_id}_${pag.mes}_${pag.ano}`;
      pagamentosMap.set(key, pag);
    });

    // Processar matriz para cada cliente
    const matriz: MatrizItem[] = clientesTyped.map(cliente => {
      const item: MatrizItem = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        pagamentos: {}
      };

      // Processar 12 meses
      for (let mes = 1; mes <= 12; mes++) {
        const key = `${cliente.id}_${mes}_${ano}`;
        const pagamento = pagamentosMap.get(key);
        
        if (pagamento) {
          item.pagamentos[mes] = {
            status: pagamento.status,
            id: pagamento.id
          };
        } else {
          item.pagamentos[mes] = null;
        }
      }

      return item;
    });

    // Implementar paginação
    const total = matriz.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMatriz = matriz.slice(startIndex, endIndex);

    console.log(`Returning paginated matriz: ${paginatedMatriz.length} items of ${total} total`);

    return new Response(JSON.stringify({
      matriz: paginatedMatriz,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-matriz-pagamentos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});