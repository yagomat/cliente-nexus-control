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
  fetchMatriz: (ano: number, search?: string, status?: string, page?: number, itemsPerPage?: number, ordenacao?: string) => Promise<void>;
  handlePagamentoMes: (clienteId: string, mes: number, ano: number) => Promise<void>;
  getPagamentoDoMes: (clienteId: string, mes: number) => { status: string; id?: string } | null;
}

export const useMatrizPagamentos = (): UseMatrizPagamentosResult => {
  const { user } = useAuth();
  const [matriz, setMatriz] = useState<MatrizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<MatrizPagination | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{ano: number, search: string, status: string, page: number, itemsPerPage: number, ordenacao: string} | null>(null);

  const fetchMatriz = useCallback(async (
    ano: number,
    search: string = '',
    status: string = 'todos',
    page: number = 1,
    itemsPerPage: number = 10,
    ordenacao: string = 'cadastro_desc'
  ) => {
    if (!user) return;

    setLoading(true);
    setLastFetchParams({ ano, search, status, page, itemsPerPage, ordenacao });
    
    try {
      const { data, error } = await supabase.functions.invoke('get-matriz-pagamentos', {
        body: {
          ano,
          search,
          status,
          page,
          itemsPerPage,
          ordenacao
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

  // Listener para atualizações realtime de pagamentos específico para matriz
  useEffect(() => {
    if (!user) return;

    console.log('🔧 Configurando realtime subscription para matriz de pagamentos');

    const channel = supabase
      .channel('matriz-pagamentos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamentos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Realtime update na matriz:', payload);
          
          try {
            // Atualizar a matriz local imediatamente
            const clienteId = (payload.new as any)?.cliente_id || (payload.old as any)?.cliente_id;
            const mes = (payload.new as any)?.mes || (payload.old as any)?.mes;
            const ano = (payload.new as any)?.ano || (payload.old as any)?.ano;
            const status = (payload.new as any)?.status;
            const id = (payload.new as any)?.id;

            if (clienteId && mes !== undefined && ano !== undefined) {
              console.log('🔄 Atualizando matriz local para cliente:', clienteId, 'mes:', mes, 'ano:', ano);
              
              setMatriz(currentMatriz => {
                const novaMatriz = [...currentMatriz];
                const clienteIndex = novaMatriz.findIndex(item => item.clienteId === clienteId);
                
                if (clienteIndex !== -1) {
                  const clienteItem = { ...novaMatriz[clienteIndex] };
                  const pagamentos = { ...clienteItem.pagamentos };
                  
                  if (payload.eventType === 'DELETE') {
                    delete pagamentos[mes];
                  } else {
                    pagamentos[mes] = { status, id };
                  }
                  
                  clienteItem.pagamentos = pagamentos;
                  novaMatriz[clienteIndex] = clienteItem;
                }
                
                return novaMatriz;
              });
              
              // Notificar outros hooks com debounce
              setTimeout(() => {
                invalidateClientesCache();
                notifyMatrizUpdate();
              }, 100);
            }
          } catch (error) {
            console.error('❌ Erro processando realtime update na matriz:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Removendo realtime subscription da matriz');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Listener para sincronização com outros hooks (sem re-fetch)
  useEffect(() => {
    const removeListener = addPagamentoUpdateListener((clienteId) => {
      console.log('📢 Matriz recebeu notificação de update para cliente:', clienteId);
      // Não fazer re-fetch, o realtime já atualizou localmente
    });

    return removeListener;
  }, []);

  const handlePagamentoMes = useCallback(async (clienteId: string, mes: number, ano: number) => {
    if (!user) return;

    try {
      // Encontrar o cliente na matriz atual
      const clienteMatriz = matriz.find(m => m.clienteId === clienteId);
      if (!clienteMatriz) return;

      const pagamentoAtual = clienteMatriz.pagamentos[mes];
      let novoStatus: string;
      let operacao: 'INSERT' | 'UPDATE';

      if (!pagamentoAtual) {
        // Primeiro clique: registrar pagamento (pago)
        novoStatus = 'pago';
        operacao = 'INSERT';
      } else {
        // Ciclar entre os status
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
        operacao = 'UPDATE';
      }

      // Atualização otimista local ANTES da requisição ao servidor
      setMatriz(currentMatriz => {
        const novaMatriz = [...currentMatriz];
        const clienteIndex = novaMatriz.findIndex(item => item.clienteId === clienteId);
        
        if (clienteIndex !== -1) {
          const clienteItem = { ...novaMatriz[clienteIndex] };
          const pagamentos = { ...clienteItem.pagamentos };
          
          // Simular o novo ID para inserções (será substituído pelo realtime)
          const novoId = operacao === 'INSERT' ? `temp-${Date.now()}` : pagamentoAtual?.id;
          pagamentos[mes] = { status: novoStatus, id: novoId };
          
          clienteItem.pagamentos = pagamentos;
          novaMatriz[clienteIndex] = clienteItem;
        }
        
        return novaMatriz;
      });

      // Executar a operação no servidor (realtime irá corrigir/confirmar)
      if (operacao === 'INSERT') {
        const { error } = await supabase
          .from('pagamentos')
          .insert({
            cliente_id: clienteId,
            user_id: user.id,
            mes: mes,
            ano: ano,
            status: novoStatus
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pagamentos')
          .update({ status: novoStatus })
          .eq('id', pagamentoAtual.id);

        if (error) throw error;
      }

      // O realtime listener irá se encarregar da atualização final
      // Não fazemos re-fetch aqui para evitar conflitos
      
    } catch (error) {
      console.error('Erro ao atualizar pagamento na matriz:', error);
      
      // Em caso de erro, reverter a atualização otimista
      if (lastFetchParams) {
        setTimeout(() => {
          fetchMatriz(
            lastFetchParams.ano,
            lastFetchParams.search,
            lastFetchParams.status,
            lastFetchParams.page,
            lastFetchParams.itemsPerPage,
            lastFetchParams.ordenacao
          );
        }, 100);
      }
      
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