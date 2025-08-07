import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calcularStatusCliente, calcularVencimentoInteligente } from "@/utils/clienteUtils";

// Função para parsing seguro de datas evitando problemas de timezone
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

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

      const agora = new Date();
      // Normalizar hoje para meia-noite para comparação correta com parseLocalDate
      const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();
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
      
      // Clientes ativos usando lógica consistente com o resto da aplicação
      const clientesAtivos = clientes?.filter(cliente => 
        calcularStatusCliente(cliente, getPagamentoDoMes)
      ).length || 0;
      
      const clientesInativos = totalClientes - clientesAtivos;
      
      const clientesNovos = clientes?.filter(c => 
        new Date(c.created_at) >= trinta_dias_atras
      ).length || 0;

      // Pagamentos pendentes usando lógica inteligente de vencimento
      const pagamentosPendentes = clientes?.filter(cliente => {
        const vencimentoInfo = calcularVencimentoInteligente(cliente, getPagamentoDoMes);
        // Cliente que venceu (dias positivos e vencido = true) ou que deve pagar agora
        return vencimentoInfo && (vencimentoInfo.vencido || vencimentoInfo.dias === 0);
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
          const dataLicenca = parseLocalDate(cliente.data_licenca_aplicativo);
          // Incluir apps que vencem hoje ou nos próximos 30 dias
          if (dataLicenca >= hoje && dataLicenca <= trinta_dias_futuro) {
            const diffTime = dataLicenca.getTime() - hoje.getTime();
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            appsVencendo.push({
              nome: cliente.nome,
              aplicativo: cliente.aplicativo,
              dias: diffDays
            });
          }
        }
        if (cliente.data_licenca_aplicativo_2) {
          const dataLicenca2 = parseLocalDate(cliente.data_licenca_aplicativo_2);
          // Incluir apps que vencem hoje ou nos próximos 30 dias
          if (dataLicenca2 >= hoje && dataLicenca2 <= trinta_dias_futuro) {
            const diffTime = dataLicenca2.getTime() - hoje.getTime();
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            appsVencendo.push({
              nome: cliente.nome,
              aplicativo: cliente.aplicativo_2 || 'App 2',
              dias: diffDays
            });
          }
        }
      });

      // Evolução de clientes ativos baseado na lógica consistente (12 meses)
      const evolucaoClientes = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        
        // Contar clientes com pagamento "pago" ou "promocao" naquele mês específico
        // Apenas considerar pagamentos de clientes que ainda existem
        const clientesAtivosNoMes = pagamentos?.filter(p => 
          p.mes === mes && 
          p.ano === ano && 
          (p.status === 'pago' || p.status === 'promocao') &&
          clientes?.some(cliente => cliente.id === p.cliente_id) // Garantir que o cliente existe
        ).reduce((unique: string[], p: any) => {
          if (!unique.includes(p.cliente_id)) {
            unique.push(p.cliente_id);
          }
          return unique;
        }, []).length || 0;
        
        evolucaoClientes.push({
          month: data.toLocaleDateString('pt-BR', { month: 'short' }),
          value: clientesAtivosNoMes
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

      // Distribuição por dispositivos únicos (apenas clientes ativos)
      const dispositivosCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (!isClienteAtivo(cliente.id)) return;
        
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

      // Distribuição por aplicativo (apenas clientes ativos)
      const appsCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (!isClienteAtivo(cliente.id)) return;
        
        appsCount[cliente.aplicativo] = (appsCount[cliente.aplicativo] || 0) + 1;
        if (cliente.aplicativo_2) {
          appsCount[cliente.aplicativo_2] = (appsCount[cliente.aplicativo_2] || 0) + 1;
        }
      });
      
      const distribuicaoAplicativo = Object.entries(appsCount).map(([name, value]) => ({
        name,
        value
      }));

      // Distribuição por UF (apenas clientes ativos)
      const ufCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (!isClienteAtivo(cliente.id)) return;
        
        if (cliente.uf) {
          ufCount[cliente.uf] = (ufCount[cliente.uf] || 0) + 1;
        }
      });
      
      const distribuicaoUF = Object.entries(ufCount).map(([name, value]) => ({
        name,
        value
      }));

      // Distribuição por servidor (apenas clientes ativos)
      const servidorCount: Record<string, number> = {};
      clientes?.forEach(cliente => {
        if (!isClienteAtivo(cliente.id)) return;
        
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