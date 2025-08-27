import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface DashboardData {
  totalClientes: number;
  clientesAtivos: number;
  clientesInativos: number;
  novosClientes: number;
  vencendoEsteMs: number;
  vencendoProximoMs: number;
  clientesVencendo3Dias: Array<{ nome: string; servidor: string; dias: number }>;
  appsVencendo30Dias: Array<{ nome: string; aplicativo: string; dias: number }>;
  valorRecebido: number;
  valorEsperado: number;
  evolucaoClientes: Array<{ mes: string; total: number }>;
  evolucaoPagamentos: Array<{ mes: string; total: number }>;
  distribuicaoDispositivos: Array<{ nome: string; total: number }>;
  distribuicaoAplicativos: Array<{ nome: string; total: number }>;
  distribuicaoUf: Array<{ nome: string; total: number }>;
  distribuicaoServidores: Array<{ nome: string; total: number }>;
}

export const useDashboardOptimized = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalClientes: 0,
    clientesAtivos: 0,
    clientesInativos: 0,
    novosClientes: 0,
    vencendoEsteMs: 0,
    vencendoProximoMs: 0,
    clientesVencendo3Dias: [],
    appsVencendo30Dias: [],
    valorRecebido: 0,
    valorEsperado: 0,
    evolucaoClientes: [],
    evolucaoPagamentos: [],
    distribuicaoDispositivos: [],
    distribuicaoAplicativos: [],
    distribuicaoUf: [],
    distribuicaoServidores: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: dashboardData, error } = await supabase.functions.invoke('get-dashboard-clientes', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Error calling dashboard edge function:', error);
        throw error;
      }

      if (dashboardData.error) {
        throw new Error(dashboardData.error);
      }

      setData(dashboardData);
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return {
    data,
    loading,
    refetch: fetchDashboardData
  };
};