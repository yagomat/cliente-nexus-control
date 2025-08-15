import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      search = '',
      status = 'todos',
      ordenacao = 'cadastro_asc',
      page = 1,
      itemsPerPage = 10,
      ano = new Date().getFullYear()
    } = await req.json();

    console.log(`Processing client calculation request: search="${search}", status="${status}", ordenacao="${ordenacao}", page=${page}, itemsPerPage=${itemsPerPage}, ano=${ano}`);

    // Buscar clientes do usuário com filtros básicos
    let clientesQuery = supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .eq('ativo', true);

    if (search.trim()) {
      clientesQuery = clientesQuery.ilike('nome', `%${search.trim()}%`);
    }

    const { data: clientes, error: clientesError } = await clientesQuery;
    
    if (clientesError) {
      console.error('Error fetching clients:', clientesError);
      throw clientesError;
    }

    console.log(`Found ${clientes?.length || 0} base clients`);

    if (!clientes || clientes.length === 0) {
      return new Response(JSON.stringify({
        clientes: [],
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

    // Buscar pagamentos do ano para todos os clientes
    const clienteIds = clientes.map(c => c.id);
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('user_id', user.id)
      .eq('ano', ano)
      .in('cliente_id', clienteIds);

    if (pagamentosError) {
      console.error('Error fetching payments:', pagamentosError);
      throw pagamentosError;
    }

    console.log(`Found ${pagamentos?.length || 0} payments for year ${ano}`);

    // Criar mapa de pagamentos para acesso rápido
    const pagamentosMap = new Map();
    pagamentos?.forEach(pag => {
      const key = `${pag.cliente_id}_${pag.mes}_${pag.ano}`;
      pagamentosMap.set(key, pag);
    });

    // Função para calcular status do cliente
    const calcularStatusCliente = (cliente: any) => {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      
      // Pagamento do mês atual
      const pagamentoMesAtual = pagamentosMap.get(`${cliente.id}_${mesAtual}_${anoAtual}`);
      if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
        return true;
      }
      
      // Pagamento do mês anterior + verificar se ainda não venceu
      let mesAnterior = mesAtual - 1;
      let anoAnterior = anoAtual;
      if (mesAnterior === 0) {
        mesAnterior = 12;
        anoAnterior = anoAtual - 1;
      }
      
      const pagamentoMesAnterior = pagamentosMap.get(`${cliente.id}_${mesAnterior}_${anoAnterior}`);
      if (pagamentoMesAnterior && (pagamentoMesAnterior.status === 'pago' || pagamentoMesAnterior.status === 'promocao')) {
        // Verificar se ainda não passou do dia de vencimento
        const diaHoje = hoje.getDate();
        return diaHoje <= cliente.dia_vencimento;
      }
      
      return false;
    };

    // Função para calcular vencimento inteligente
    const calcularVencimentoInteligente = (cliente: any) => {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      
      const clienteAtivo = calcularStatusCliente(cliente);
      
      if (clienteAtivo) {
        // Cliente ativo: encontrar primeiro gap nos pagamentos futuros
        let mes = mesAtual;
        let ano = anoAtual;
        
        for (let i = 0; i < 12; i++) {
          const pagamento = pagamentosMap.get(`${cliente.id}_${mes}_${ano}`);
          
          if (!pagamento || (pagamento.status !== 'pago' && pagamento.status !== 'promocao')) {
            // Calcular dias até o vencimento deste mês
            const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
            const diaEfetivo = Math.min(cliente.dia_vencimento, ultimoDiaDoMes);
            const dataVencimento = new Date(ano, mes - 1, diaEfetivo);
            
            const diffTime = dataVencimento.getTime() - hoje.getTime();
            const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              dias,
              texto: dias === 0 ? `Vence hoje` : dias < 0 ? `Venceu há ${Math.abs(dias)} dias` : `Vence em ${dias} dias`,
              vencido: dias < 0
            };
          }
          
          // Avançar para próximo mês
          mes++;
          if (mes > 12) {
            mes = 1;
            ano++;
          }
        }
        
        return {
          dias: 365,
          texto: 'Pago por 12 meses',
          vencido: false
        };
      } else {
        // Cliente inativo: encontrar quando se tornou inativo
        let mes = mesAtual;
        let ano = anoAtual;
        
        for (let i = 0; i < 12; i++) {
          mes--;
          if (mes < 1) {
            mes = 12;
            ano--;
          }
          
          const pagamento = pagamentosMap.get(`${cliente.id}_${mes}_${ano}`);
          if (pagamento && (pagamento.status === 'pago' || pagamento.status === 'promocao')) {
            // Encontrou último mês pago, cliente se tornou inativo no mês seguinte
            let mesInativo = mes + 1;
            let anoInativo = ano;
            if (mesInativo > 12) {
              mesInativo = 1;
              anoInativo++;
            }
            
            const ultimoDiaDoMes = new Date(anoInativo, mesInativo, 0).getDate();
            const diaEfetivo = Math.min(cliente.dia_vencimento, ultimoDiaDoMes);
            const dataVencimento = new Date(anoInativo, mesInativo - 1, diaEfetivo);
            
            const diffTime = hoje.getTime() - dataVencimento.getTime();
            const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              dias,
              texto: `Venceu há ${dias} dias`,
              vencido: true
            };
          }
        }
        
        return {
          dias: 9999,
          texto: 'Sem histórico',
          vencido: true
        };
      }
    };

    // Processar clientes com cálculos
    const clientesComCalculos = clientes.map(cliente => {
      const statusAtivo = calcularStatusCliente(cliente);
      const vencimentoInfo = calcularVencimentoInteligente(cliente);
      
      return {
        ...cliente,
        status_ativo: statusAtivo,
        vencimento_dias: vencimentoInfo?.dias || null,
        vencimento_texto: vencimentoInfo?.texto || null,
        vencimento_vencido: vencimentoInfo?.vencido || false,
        ordem_vencimento: vencimentoInfo?.vencido ? -Math.abs(vencimentoInfo.dias) : (vencimentoInfo?.dias || 9999)
      };
    });

    // Aplicar filtros de status
    let clientesFiltrados = clientesComCalculos;
    if (status !== 'todos') {
      if (status === 'ativo') {
        clientesFiltrados = clientesComCalculos.filter(c => c.status_ativo);
      } else if (status === 'inativo') {
        clientesFiltrados = clientesComCalculos.filter(c => !c.status_ativo);
      } else if (status === 'vencido') {
        clientesFiltrados = clientesComCalculos.filter(c => c.vencimento_vencido);
      }
    }

    // Aplicar ordenação
    if (ordenacao.includes('nome')) {
      const asc = ordenacao.includes('asc');
      clientesFiltrados.sort((a, b) => {
        const comparison = a.nome.localeCompare(b.nome);
        return asc ? comparison : -comparison;
      });
    } else if (ordenacao.includes('vencimento')) {
      const asc = ordenacao.includes('asc');
      clientesFiltrados.sort((a, b) => {
        const comparison = a.ordem_vencimento - b.ordem_vencimento;
        return asc ? comparison : -comparison;
      });
    } else if (ordenacao.includes('cadastro')) {
      const asc = ordenacao.includes('asc');
      clientesFiltrados.sort((a, b) => {
        const comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return asc ? comparison : -comparison;
      });
    }

    // Aplicar paginação
    const total = clientesFiltrados.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

    console.log(`Returning ${clientesPaginados.length} clients with calculations`);

    return new Response(JSON.stringify({
      clientes: clientesPaginados,
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
    console.error('Error in get-clientes-com-calculos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});