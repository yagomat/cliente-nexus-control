import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { addPagamentoUpdateListener } from "@/hooks/usePagamentos";
import { invalidateClientesCache } from "@/hooks/useClientesCalculos";

// Estado global para notificar sobre atualizações da matriz
let matrizUpdateListeners: (() => void)[] = [];

export const addMatrizUpdateListener = (listener: () => void) => {
  matrizUpdateListeners.push(listener);
  
  return () => {
    matrizUpdateListeners = matrizUpdateListeners.filter(l => l !== listener);
  };
};

const notifyMatrizUpdate = () => {
  matrizUpdateListeners.forEach(listener => listener());
};

interface MatrizItem {
  clienteId: string;
  clienteNome: string;
  pagamentos: Record<number, { status: string; id?: string } | null>;
}

interface MatrizPagination {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

interface UseMatrizPagamentosResult {
  matriz: MatrizItem[];
  loading: boolean;
  pagination: MatrizPagination | null;
  fetchMatriz: (ano: number, search?: string, page?: number, itemsPerPage?: number) => Promise<void>;
  handlePagamentoMes: (clienteId: string, mes: number, ano: number) => Promise<void>;
  getPagamentoDoMes: (clienteId: string, mes: number) => { status: string; id?: string } | null;
}

export const useMatrizPagamentos = (): UseMatrizPagamentosResult => {
  const { user } = useAuth();
  const [matriz, setMatriz] = useState<MatrizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<MatrizPagination | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{ano: number, search: string, page: number, itemsPerPage: number} | null>(null);

  const fetchMatriz = useCallback(async (
    ano: number,
    search: string = '',
    page: number = 1,
    itemsPerPage: number = 10
  ) => {
    if (!user) return;

    setLoading(true);
    setLastFetchParams({ ano, search, page, itemsPerPage });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-matriz-pagamentos', {
        body: {
          ano,
          search,
          page,
          itemsPerPage
        }
      });

      if (error) throw error;

      setMatriz(data.matriz || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Erro ao buscar matriz de pagamentos:', error);
      setMatriz([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Listener para atualizações de pagamentos de outros hooks
  useEffect(() => {
    const removeListener = addPagamentoUpdateListener(() => {
      // Re-fetch com os últimos parâmetros se existirem
      if (lastFetchParams) {
        fetchMatriz(
          lastFetchParams.ano,
          lastFetchParams.search,
          lastFetchParams.page,
          lastFetchParams.itemsPerPage
        );
      }
    });

    return removeListener;
  }, [fetchMatriz, lastFetchParams]);

  const handlePagamentoMes = useCallback(async (clienteId: string, mes: number, ano: number) => {
    if (!user) return;

    try {
      // Encontrar o cliente na matriz atual
      const clienteMatriz = matriz.find(m => m.clienteId === clienteId);
      if (!clienteMatriz) return;

      const pagamentoAtual = clienteMatriz.pagamentos[mes];

      if (!pagamentoAtual) {
        // Primeiro clique: registrar pagamento (pago)
        const { error } = await supabase
          .from('pagamentos')
          .insert({
            cliente_id: clienteId,
            user_id: user.id,
            mes: mes,
            ano: ano,
            status: 'pago'
          });

        if (error) throw error;
      } else {
        // Ciclar entre os status
        let novoStatus;
        switch (pagamentoAtual.status) {
          case 'pago':
            novoStatus = 'promocao';
            break;
          case 'promocao':
            novoStatus = 'removido';
            break;
          case 'removido':
            novoStatus = 'pago';
            break;
          default:
            novoStatus = 'pago';
        }

        const { error } = await supabase
          .from('pagamentos')
          .update({ status: novoStatus })
          .eq('id', pagamentoAtual.id);

        if (error) throw error;
      }

      // Recarregar a matriz após a atualização
      if (lastFetchParams) {
        await fetchMatriz(lastFetchParams.ano, lastFetchParams.search, lastFetchParams.page, lastFetchParams.itemsPerPage);
      }
      
      // Notificar outros hooks para sincronização
      invalidateClientesCache();
      notifyMatrizUpdate();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  }, [user, matriz, lastFetchParams, fetchMatriz]);

  const getPagamentoDoMes = useCallback((clienteId: string, mes: number) => {
    const clienteMatriz = matriz.find(m => m.clienteId === clienteId);
    return clienteMatriz?.pagamentos[mes] || null;
  }, [matriz]);

  return {
    matriz,
    loading,
    pagination,
    fetchMatriz,
    handlePagamentoMes,
    getPagamentoDoMes
  };
};