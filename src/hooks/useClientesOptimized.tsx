import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ClienteComStatus {
  id: string;
  nome: string;
  telefone: string;
  uf?: string;
  servidor: string;
  dia_vencimento: number;
  valor_plano?: number;
  dispositivo_smart?: string;
  aplicativo: string;
  usuario_aplicativo?: string;
  senha_aplicativo?: string;
  data_licenca_aplicativo?: string;
  tela_adicional?: boolean;
  observacoes?: string;
  ativo?: boolean;
  created_at: string;
  updated_at: string;
  dispositivo_smart_2?: string;
  aplicativo_2?: string;
  usuario_aplicativo_2?: string;
  senha_aplicativo_2?: string;
  data_licenca_aplicativo_2?: string;
  deleted_at?: string;
  codigo_pais?: string;
  status_calculado: boolean;
}

interface UseClientesOptimizedResult {
  clientes: ClienteComStatus[];
  loading: boolean;
  pagination: PaginationInfo | null;
  fetchClientes: (filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  }) => Promise<void>;
}

export const useClientesOptimized = (): UseClientesOptimizedResult => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteComStatus[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async (filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  } = {}) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const searchParams = new URLSearchParams();
      if (filters.search) searchParams.set('search', filters.search);
      if (filters.status) searchParams.set('status', filters.status);
      if (filters.ordenacao) searchParams.set('ordenacao', filters.ordenacao);
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.itemsPerPage) searchParams.set('itemsPerPage', filters.itemsPerPage.toString());
      if (filters.ano) searchParams.set('ano', filters.ano.toString());

      const { data, error } = await supabase.functions.invoke('get-clientes-filtrados', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setClientes(data.clientes || []);
      setPagination(data.pagination || null);
      
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClientes();
    }
  }, [user]);

  return {
    clientes,
    loading,
    pagination,
    fetchClientes
  };
};