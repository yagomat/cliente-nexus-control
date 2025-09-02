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
  created_at: string;
  valor_plano: number | null;
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
  statusAtivo?: boolean;
  diaVencimento: number;
  valorPlano: number | null;
  vencimentoDias: number;
  vencimentoTexto: string;
  vencimentoVencido: boolean;
}

// Função para obter a data atual em São Paulo
const getHojeSaoPaulo = (): Date => {
  return new Date(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()));
};

// Função para normalizar data para início do dia em São Paulo
const normalizarDataSaoPaulo = (data: Date): Date => {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(data);
  
  return new Date(formatted + 'T00:00:00.000Z');
};

// Função para calcular data de vencimento real
const calcularDataVencimentoReal = (ano: number, mes: number, diaVencimento: number): Date => {
  const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
  const diaReal = Math.min(diaVencimento, ultimoDiaDoMes);
  
  const dataVencimento = new Date(ano, mes - 1, diaReal);
  return normalizarDataSaoPaulo(dataVencimento);
};

// Função para calcular status do cliente baseado nos pagamentos
const calcularStatusCliente = (cliente: DatabaseClient, pagamentosMap: Map<string, DatabasePagamento>): boolean => {
  const hoje = normalizarDataSaoPaulo(getHojeSaoPaulo());
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Buscar pagamento do mês atual
  const keyMesAtual = `${cliente.id}_${mesAtual}_${anoAtual}`;
  const pagamentoMesAtual = pagamentosMap.get(keyMesAtual);
  
  // Se tem pagamento no mês atual como pago/promoção, está ativo
  if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
    return true;
  }
  
  // Calcular mês anterior
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }
  
  // Buscar pagamento do mês anterior
  const keyMesAnterior = `${cliente.id}_${mesAnterior}_${anoAnterior}`;
  const pagamentoMesAnterior = pagamentosMap.get(keyMesAnterior);
  
  // Se tem pagamento no mês anterior como pago/promoção E ainda não passou do dia de vencimento
  if (pagamentoMesAnterior && (pagamentoMesAnterior.status === 'pago' || pagamentoMesAnterior.status === 'promocao')) {
    // Calcular data de vencimento real do mês atual
    const dataVencimento = calcularDataVencimentoReal(anoAtual, mesAtual, cliente.dia_vencimento);
    return hoje <= dataVencimento;
  }
  
  return false;
};

// Função para calcular informações de vencimento (mesma lógica do frontend)
const calcularVencimentoInteligente = (cliente: DatabaseClient, pagamentosMap: Map<string, DatabasePagamento>) => {
  const hoje = normalizarDataSaoPaulo(getHojeSaoPaulo());
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Verificar se cliente está ativo
  const clienteAtivo = calcularStatusCliente(cliente, pagamentosMap);
  
  if (clienteAtivo) {
    // Cliente ativo: encontrar primeiro gap nos pagamentos futuros
    let mes = mesAtual;
    let ano = anoAtual;
    
    // Percorrer meses consecutivos para encontrar o primeiro gap
    for (let i = 0; i < 12; i++) {
      const key = `${cliente.id}_${mes}_${ano}`;
      const pagamento = pagamentosMap.get(key);
      
      // Se não tem pagamento ou status não é válido, encontrou o gap
      if (!pagamento || (pagamento.status !== 'pago' && pagamento.status !== 'promocao')) {
        // Calcular dias até o vencimento deste mês (quando cliente se tornará inativo)
        const dataVencimento = calcularDataVencimentoReal(ano, mes, cliente.dia_vencimento);
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
    
    // Se não encontrou gap em 12 meses, usar último mês verificado
    const dataVencimento = calcularDataVencimentoReal(ano, mes, cliente.dia_vencimento);
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      dias,
      texto: `Vence em ${dias} dias`,
      vencido: false
    };
  } else {
    // Cliente inativo: encontrar quando se tornou inativo
    let mes = mesAtual;
    let ano = anoAtual;
    
    // Buscar o último mês pago no passado
    for (let i = 0; i < 12; i++) {
      mes--;
      if (mes < 1) {
        mes = 12;
        ano--;
      }
      
      const key = `${cliente.id}_${mes}_${ano}`;
      const pagamento = pagamentosMap.get(key);
      if (pagamento && (pagamento.status === 'pago' || pagamento.status === 'promocao')) {
        // Encontrou último mês pago, cliente se tornou inativo no mês seguinte
        let mesInativo = mes + 1;
        let anoInativo = ano;
        if (mesInativo > 12) {
          mesInativo = 1;
          anoInativo++;
        }
        
        const dataVencimento = calcularDataVencimentoReal(anoInativo, mesInativo, cliente.dia_vencimento);
        const diffTime = hoje.getTime() - dataVencimento.getTime();
        const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          dias,
          texto: `Venceu há ${dias} dias`,
          vencido: true
        };
      }
    }
    
    // Se não encontrou histórico de pagamento, mostrar "Nunca pagou"
    return {
      dias: 0,
      texto: 'Nunca pagou',
      vencido: false
    };
  }
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
      ano = new Date().getFullYear(),
      search = '',
      status = 'todos',
      page = 1,
      itemsPerPage = 10,
      ordenacao = 'cadastro_desc'
    } = await req.json();

    console.log(`Processing matriz request: ano=${ano}, search="${search}", status="${status}", page=${page}, itemsPerPage=${itemsPerPage}, ordenacao=${ordenacao}`);

    // Buscar clientes do usuário (remover filtro de status aqui - aplicar depois do cálculo)
    let clientesQuery = supabase
      .from('clientes')
      .select('id, nome, dia_vencimento, ativo, deleted_at, created_at, valor_plano')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (search.trim()) {
      clientesQuery = clientesQuery.ilike('nome', `%${search.trim()}%`);
    }

    // Aplicar ordenação
    switch (ordenacao) {
      case 'cadastro_asc':
        clientesQuery = clientesQuery.order('created_at', { ascending: true }).order('id', { ascending: true });
        break;
      case 'cadastro_desc':
        clientesQuery = clientesQuery.order('created_at', { ascending: false }).order('id', { ascending: true });
        break;
      case 'nome-az_asc':
        clientesQuery = clientesQuery.order('nome', { ascending: true });
        break;
      case 'nome-za_desc':
        clientesQuery = clientesQuery.order('nome', { ascending: false });
        break;
      case 'vencimento_asc':
        clientesQuery = clientesQuery.order('dia_vencimento', { ascending: true });
        break;
      case 'vencimento_desc':
        clientesQuery = clientesQuery.order('dia_vencimento', { ascending: false });
        break;
      default:
        // Padrão: cadastro mais recente primeiro
        clientesQuery = clientesQuery.order('created_at', { ascending: false });
    }

    const { data: clientes, error: clientesError } = await clientesQuery;
    
    if (clientesError) {
      console.error('Error fetching clients:', clientesError);
      throw clientesError;
    }

    const clientesTyped = clientes as DatabaseClient[];
    console.log(`Found ${clientesTyped.length} base clients`);

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

    // Buscar pagamentos do ano atual E anterior para cálculo de status
    const hoje = getHojeSaoPaulo();
    const anoAtual = hoje.getFullYear();
    const anoAnterior = anoAtual - 1;
    
    const clienteIds = clientesTyped.map(c => c.id);
    
    // Buscar pagamentos do ano solicitado + ano atual e anterior (para cálculo de status)
    const anosParaBuscar = [ano];
    if (ano !== anoAtual) anosParaBuscar.push(anoAtual);
    if (ano !== anoAnterior && anoAtual !== anoAnterior) anosParaBuscar.push(anoAnterior);
    
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('id, cliente_id, mes, ano, status')
      .eq('user_id', user.id)
      .in('ano', anosParaBuscar)
      .in('cliente_id', clienteIds);

    if (pagamentosError) {
      console.error('Error fetching payments:', pagamentosError);
      throw pagamentosError;
    }

    const pagamentosTyped = pagamentos as DatabasePagamento[];
    console.log(`Found ${pagamentosTyped.length} payments for years ${anosParaBuscar.join(', ')}`);

    // Criar mapa de pagamentos para acesso rápido
    const pagamentosMap = new Map<string, DatabasePagamento>();
    pagamentosTyped.forEach(pag => {
      const key = `${pag.cliente_id}_${pag.mes}_${pag.ano}`;
      pagamentosMap.set(key, pag);
    });

    // Processar matriz para cada cliente com cálculo de status e vencimento
    const matrizCompleta: MatrizItem[] = clientesTyped.map(cliente => {
      const statusAtivo = calcularStatusCliente(cliente, pagamentosMap);
      const vencimentoInfo = calcularVencimentoInteligente(cliente, pagamentosMap);
      
      const item: MatrizItem = {
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        pagamentos: {},
        statusAtivo,
        diaVencimento: cliente.dia_vencimento,
        valorPlano: cliente.valor_plano,
        vencimentoDias: vencimentoInfo.dias,
        vencimentoTexto: vencimentoInfo.texto,
        vencimentoVencido: vencimentoInfo.vencido
      };

      // Processar 12 meses do ano solicitado
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

    // Aplicar filtro de status baseado no status calculado
    let matrizFiltrada = matrizCompleta;
    if (status === 'ativo') {
      matrizFiltrada = matrizCompleta.filter(item => item.statusAtivo);
    } else if (status === 'inativo') {
      matrizFiltrada = matrizCompleta.filter(item => !item.statusAtivo);
    }
    // Para "todos", não filtrar
    
    console.log(`After status filter: ${matrizFiltrada.length} clients (${status} filter applied)`);

    // Implementar paginação
    const total = matrizFiltrada.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMatriz = matrizFiltrada.slice(startIndex, endIndex);

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