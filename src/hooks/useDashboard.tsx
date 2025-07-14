import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    clientesNovos: 0,
    pagamentosPendentes: 0,
    valorRecebido: 0,
    clientesVencendo: 0,
    appsVencendo: 0,
    evolucaoClientes: [] as Array<{ month: string; value: number }>,
    evolucaoPagamentos: [] as Array<{ month: string; value: number }>,
    distribuicaoDispositivo: [] as Array<{ name: string; value: number }>,
    distribuicaoAplicativo: [] as Array<{ name: string; value: number }>,
    distribuicaoUF: [] as Array<{ name: string; value: number }>,
    distribuicaoServidor: [] as Array<{ name: string; value: number }>
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

      // Calcular métricas básicas
      const totalClientes = clientes?.length || 0;
      const clientesAtivos = clientes?.filter(c => c.ativo).length || 0;
      const clientesInativos = totalClientes - clientesAtivos;
      
      const clientesNovos = clientes?.filter(c => 
        new Date(c.created_at) >= trinta_dias_atras
      ).length || 0;

      // Clientes que estavam ativos no mês anterior mas não pagaram este mês
      const pagamentosPendentes = clientes?.filter(cliente => {
        if (!cliente.ativo) return false;
        
        const pagamentoMesAtual = pagamentos?.find(p => 
          p.cliente_id === cliente.id && 
          p.mes === mesAtual && 
          p.ano === anoAtual &&
          p.status === 'pago'
        );
        
        return !pagamentoMesAtual;
      }).length || 0;

      // Valor recebido no mês atual
      const pagamentosMesAtual = pagamentos?.filter(p => 
        p.mes === mesAtual && 
        p.ano === anoAtual && 
        p.status === 'pago'
      ) || [];

      const valorRecebido = pagamentosMesAtual.reduce((total, pagamento) => {
        const cliente = clientes?.find(c => c.id === pagamento.cliente_id);
        return total + (cliente?.valor_plano || 0);
      }, 0);

      // Clientes vencendo em 3 dias
      const clientesVencendo = clientes?.filter(cliente => {
        if (!cliente.ativo) return false;
        const diaVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), cliente.dia_vencimento);
        if (diaVencimento < hoje) {
          diaVencimento.setMonth(diaVencimento.getMonth() + 1);
        }
        return diaVencimento <= tres_dias_futuro;
      }).length || 0;

      // Apps com licenças vencendo em 30 dias
      const trinta_dias_futuro = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
      let appsVencendo = 0;
      
      clientes?.forEach(cliente => {
        if (cliente.data_licenca_aplicativo && new Date(cliente.data_licenca_aplicativo) <= trinta_dias_futuro) {
          appsVencendo++;
        }
        if (cliente.data_licenca_aplicativo_2 && new Date(cliente.data_licenca_aplicativo_2) <= trinta_dias_futuro) {
          appsVencendo++;
        }
      });

      // Evolução de clientes ativos (12 meses)
      const evolucaoClientes = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const clientesAteData = clientes?.filter(c => 
          new Date(c.created_at) <= data && c.ativo
        ).length || 0;
        
        evolucaoClientes.push({
          month: data.toLocaleDateString('pt-BR', { month: 'short' }),
          value: clientesAteData
        });
      }

      // Evolução de pagamentos (12 meses)
      const evolucaoPagamentos = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        
        const pagamentosMes = pagamentos?.filter(p => 
          p.mes === mes && p.ano === ano && p.status === 'pago'
        ) || [];
        
        const valorMes = pagamentosMes.reduce((total, pagamento) => {
          const cliente = clientes?.find(c => c.id === pagamento.cliente_id);
          return total + (cliente?.valor_plano || 0);
        }, 0);
        
        evolucaoPagamentos.push({
          month: data.toLocaleDateString('pt-BR', { month: 'short' }),
          value: valorMes
        });
      }

      // Distribuições
      const distribuicaoDispositivo = [
        {
          name: "Uma tela",
          value: clientes?.filter(c => !c.tela_adicional).length || 0
        },
        {
          name: "Duas telas",
          value: clientes?.filter(c => c.tela_adicional).length || 0
        }
      ];

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