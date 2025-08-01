import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calcularStatusCliente, calcularVencimentoInteligente } from "@/utils/clienteUtils";

interface DashboardData {
  totalClientes: number;
  clientesAtivos: number;
  clientesInativos: number;
  clientesNovos: number;
  pagamentosPendentes: number;
  valorRecebido: number;
  clientesVencendo: Array<{ nome: string; servidor: string; dias: number }>;
  appsVencendo: Array<{ nome: string; aplicativo: string; dias: number }>;
  evolucaoClientes: Array<{ month: string; value: number }>;
  evolucaoPagamentos: Array<{ month: string; value: number }>;
  distribuicaoDispositivo: Array<{ name: string; value: number }>;
  distribuicaoAplicativo: Array<{ name: string; value: number }>;
  distribuicaoUF: Array<{ name: string; value: number }>;
  distribuicaoServidor: Array<{ name: string; value: number }>;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    clientesNovos: 0,
    pagamentosPendentes: 0,
    valorRecebido: 0,
    clientesVencendo: [],
    appsVencendo: [],
    evolucaoClientes: [],
    evolucaoPagamentos: [],
    distribuicaoDispositivo: [],
    distribuicaoAplicativo: [],
    distribuicaoUF: [],
    distribuicaoServidor: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user?.id);

      if (clientesError) throw clientesError;

      // Buscar pagamentos
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user?.id);

      if (pagamentosError) throw pagamentosError;

      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      const trinta_dias_atras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      const tres_dias_futuro = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Função auxiliar para buscar pagamento de um cliente em um mês específico
      const getPagamentoDoMes = (clienteId: string, mes: number, ano: number) => {
        return pagamentos?.find(p => 
          p.cliente_id === clienteId && 
          p.mes === mes && 
          p.ano === ano
        );
      };

      // Clientes ativos são aqueles que realmente têm status ativo baseado nos pagamentos
      const isClienteAtivo = (clienteId: string) => {
        const cliente = clientes?.find(c => c.id === clienteId);
        if (!cliente) return false;
        return calcularStatusCliente(cliente, getPagamentoDoMes);
      };

      // Calcular métricas básicas corrigidas
      const totalClientes = clientes?.length || 0;
      
      // Clientes ativos no mês vigente: tem ativo=true E tem pagamento no mês atual
      const clientesAtivos = clientes?.filter(cliente => {
        if (!cliente.ativo) return false;
        
        const pagamentoMesAtual = pagamentos?.find(p => 
          p.cliente_id === cliente.id && 
          p.mes === mesAtual && 
          p.ano === anoAtual &&
          (p.status === 'pago' || p.status === 'promocao')
        );
        
        return !!pagamentoMesAtual;
      }).length || 0;
      
      const clientesInativos = totalClientes - clientesAtivos;
      
      const clientesNovos = clientes?.filter(c => 
        new Date(c.created_at) >= trinta_dias_atras
      ).length || 0;

      // Clientes que estavam ativos mas não pagaram este mês
      const pagamentosPendentes = clientes?.filter(cliente => {
        if (!cliente.ativo) return false;
        
        const pagamentoMesAtual = pagamentos?.find(p => 
          p.cliente_id === cliente.id && 
          p.mes === mesAtual && 
          p.ano === anoAtual &&
          (p.status === 'pago' || p.status === 'promocao')
        );
        
        // Se não tem pagamento no mês atual, mas tinha no anterior, é pendente
        const pagamentoMesAnterior = pagamentos?.find(p => 
          p.cliente_id === cliente.id && 
          p.mes === (mesAtual === 1 ? 12 : mesAtual - 1) && 
          p.ano === (mesAtual === 1 ? anoAtual - 1 : anoAtual) &&
          (p.status === 'pago' || p.status === 'promocao')
        );
        
        return !pagamentoMesAtual && pagamentoMesAnterior;
      }).length || 0;

      // Valor recebido no mês atual
      const pagamentosMesAtual = pagamentos?.filter(p => 
        p.mes === mesAtual && 
        p.ano === anoAtual && 
        (p.status === 'pago' || p.status === 'promocao')
      ) || [];

      const valorRecebido = pagamentosMesAtual.reduce((total, pagamento) => {
        const cliente = clientes?.find(c => c.id === pagamento.cliente_id);
        return total + (cliente?.valor_plano || 0);
      }, 0);

      // Clientes vencendo em 3 dias (usando lógica inteligente)
      const clientesVencendo = clientes?.filter(cliente => {
        const vencimentoInfo = calcularVencimentoInteligente(cliente, getPagamentoDoMes);
        // Incluir apenas clientes ativos que vencerão em 3 dias ou menos (não vencidos)
        return vencimentoInfo && !vencimentoInfo.vencido && vencimentoInfo.dias <= 3;
      }).map(cliente => {
        const vencimentoInfo = calcularVencimentoInteligente(cliente, getPagamentoDoMes);
        return {
          nome: cliente.nome,
          servidor: cliente.servidor,
          dias: vencimentoInfo?.dias || 0
        };
      }) || [];

      // Apps com licenças vencendo em 30 dias (com detalhes) - apenas futuros, não vencidos
      const trinta_dias_futuro = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
      const appsVencendo: Array<{ nome: string; aplicativo: string; dias: number }> = [];
      
      clientes?.forEach(cliente => {
        if (!isClienteAtivo(cliente.id)) return;
        
        if (cliente.data_licenca_aplicativo) {
          const dataLicenca = new Date(cliente.data_licenca_aplicativo);
          // Apenas apps que vão vencer no futuro (não já vencidos)
          if (dataLicenca > hoje && dataLicenca <= trinta_dias_futuro) {
            const diffTime = dataLicenca.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            appsVencendo.push({
              nome: cliente.nome,
              aplicativo: cliente.aplicativo,
              dias: diffDays
            });
          }
        }
        if (cliente.data_licenca_aplicativo_2) {
          const dataLicenca2 = new Date(cliente.data_licenca_aplicativo_2);
          // Apenas apps que vão vencer no futuro (não já vencidos)
          if (dataLicenca2 > hoje && dataLicenca2 <= trinta_dias_futuro) {
            const diffTime = dataLicenca2.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            appsVencendo.push({
              nome: cliente.nome,
              aplicativo: cliente.aplicativo_2 || 'App 2',
              dias: diffDays
            });
          }
        }
      });

      // Evolução de clientes ativos baseado em pagamentos históricos (12 meses)
      const evolucaoClientes = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        
        // Contar clientes que tinham pagamento naquele mês (independente do status atual)
        const clientesComPagamento = pagamentos?.filter(p => 
          p.mes === mes && 
          p.ano === ano &&
          (p.status === 'pago' || p.status === 'promocao')
        ).map(p => p.cliente_id) || [];
        
        // Remove duplicatas e conta clientes únicos
        const clientesUnicos = [...new Set(clientesComPagamento)].length;
        
        evolucaoClientes.push({
          month: data.toLocaleDateString('pt-BR', { month: 'short' }),
          value: clientesUnicos
        });
      }

      // Evolução de pagamentos (12 meses) - valor total arrecadado baseado no histórico
      const evolucaoPagamentos = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        
        // Buscar todos os pagamentos do mês (pagos ou promoção)
        const pagamentosMes = pagamentos?.filter(p => 
          p.mes === mes && 
          p.ano === ano && 
          (p.status === 'pago' || p.status === 'promocao')
        ) || [];
        
        // Calcular valor total baseado no valor do plano do cliente no momento do pagamento
        const valorMes = pagamentosMes.reduce((total, pagamento) => {
          const cliente = clientes?.find(c => c.id === pagamento.cliente_id);
          return total + (cliente?.valor_plano || 0);
        }, 0);
        
        evolucaoPagamentos.push({
          month: data.toLocaleDateString('pt-BR', { month: 'short' }),
          value: valorMes
        });
      }

      // Distribuição por dispositivos únicos
      const dispositivosCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (cliente.dispositivo_smart) {
          dispositivosCount[cliente.dispositivo_smart] = (dispositivosCount[cliente.dispositivo_smart] || 0) + 1;
        }
        if (cliente.dispositivo_smart_2) {
          dispositivosCount[cliente.dispositivo_smart_2] = (dispositivosCount[cliente.dispositivo_smart_2] || 0) + 1;
        }
      });
      
      const distribuicaoDispositivo = Object.entries(dispositivosCount).map(([name, value]) => ({
        name,
        value
      }));

      // Distribuição por aplicativo
      const appsCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        appsCount[cliente.aplicativo] = (appsCount[cliente.aplicativo] || 0) + 1;
        if (cliente.aplicativo_2) {
          appsCount[cliente.aplicativo_2] = (appsCount[cliente.aplicativo_2] || 0) + 1;
        }
      });
      
      const distribuicaoAplicativo = Object.entries(appsCount).map(([name, value]) => ({
        name,
        value
      }));

      // Distribuição por UF
      const ufCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (cliente.uf) {
          ufCount[cliente.uf] = (ufCount[cliente.uf] || 0) + 1;
        }
      });
      
      const distribuicaoUF = Object.entries(ufCount).map(([name, value]) => ({
        name,
        value
      }));

      // Distribuição por servidor
      const servidorCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        servidorCount[cliente.servidor] = (servidorCount[cliente.servidor] || 0) + 1;
      });
      
      const distribuicaoServidor = Object.entries(servidorCount).map(([name, value]) => ({
        name,
        value
      }));

      setDashboardData({
        totalClientes,
        clientesAtivos,
        clientesInativos,
        clientesNovos,
        pagamentosPendentes,
        valorRecebido,
        clientesVencendo,
        appsVencendo,
        evolucaoClientes,
        evolucaoPagamentos,
        distribuicaoDispositivo,
        distribuicaoAplicativo,
        distribuicaoUF,
        distribuicaoServidor
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    refreshData: fetchDashboardData
  };
};