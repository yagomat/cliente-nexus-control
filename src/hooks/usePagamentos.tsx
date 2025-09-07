import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { invalidateClientesCache } from "@/hooks/useClientesCalculos";
import { addMatrizUpdateListener } from "@/hooks/useMatrizPagamentos";

// Estado global para sincronização
let globalPagamentos: any[] = [];
let listeners: (() => void)[] = [];
let pagamentoUpdateListeners: ((clienteId?: string) => void)[] = [];

// Função para notificar sobre atualizações de pagamentos
export const notifyPagamentoUpdate = (clienteId?: string) => {
  pagamentoUpdateListeners.forEach(listener => listener(clienteId));
};

// Função para registrar listener de atualizações de pagamentos
export const addPagamentoUpdateListener = (listener: (clienteId?: string) => void) => {
  pagamentoUpdateListeners.push(listener);
  
  // Retorna função para remover o listener
  return () => {
    pagamentoUpdateListeners = pagamentoUpdateListeners.filter(l => l !== listener);
  };
};

export const usePagamentos = () => {
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<any[]>(globalPagamentos);
  
  const notifyAllListeners = () => {
    listeners.forEach(listener => listener());
  };

  const fetchPagamentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      globalPagamentos = data || [];
      setPagamentos([...globalPagamentos]);
      notifyAllListeners();
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    }
  }, [user]);
  
  // Configurar realtime subscription para pagamentos
  useEffect(() => {
    if (!user) return;

    console.log('🔧 Configurando realtime subscription para pagamentos');

    const channel = supabase
      .channel('pagamentos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamentos',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔴 Realtime update recebido:', payload.eventType, payload);
          
          try {
            // Atualizar dados de forma síncrona primeiro
            if (payload.eventType === 'INSERT' && payload.new) {
              console.log('➕ Inserindo pagamento no estado local');
              globalPagamentos.push(payload.new);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              console.log('🔄 Atualizando pagamento no estado local');
              const index = globalPagamentos.findIndex(p => p.id === payload.new.id);
              if (index >= 0) {
                globalPagamentos[index] = payload.new;
              }
            } else if (payload.eventType === 'DELETE' && payload.old) {
              console.log('🗑️ Removendo pagamento do estado local');
              const index = globalPagamentos.findIndex(p => p.id === payload.old.id);
              if (index >= 0) {
                globalPagamentos.splice(index, 1);
              }
            }

            // Atualizar estado local imediatamente
            setPagamentos([...globalPagamentos]);
            notifyAllListeners();

            // Identificar o cliente afetado e notificar com debounce
            const clienteId = (payload.new as any)?.cliente_id || (payload.old as any)?.cliente_id;
            if (clienteId) {
              console.log('📢 Notificando atualização para cliente:', clienteId);
              // Debounce para evitar múltiplas atualizações simultâneas
              setTimeout(() => {
                notifyPagamentoUpdate(clienteId);
              }, 100);
            }

          } catch (error) {
            console.error('❌ Erro processando realtime update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Removendo realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user]); // Removido fetchPagamentos das dependências
  
  // Registrar listener para atualizações globais
  useEffect(() => {
    const updateListener = () => {
      setPagamentos([...globalPagamentos]);
    };
    
    listeners.push(updateListener);
    
    return () => {
      listeners = listeners.filter(l => l !== updateListener);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchPagamentos();
    }
  }, [user, fetchPagamentos]);

  // Listener para atualizações da matriz
  useEffect(() => {
    const removeListener = addMatrizUpdateListener(() => {
      fetchPagamentos();
    });

    return removeListener;
  }, [fetchPagamentos]);

  const getPagamentoMesAtual = (clienteId: string) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    return pagamentos.find(p => 
      p.cliente_id === clienteId && 
      p.mes === mesAtual && 
      p.ano === anoAtual
    );
  };

  const handlePagamento = async (clienteId: string) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    await handlePagamentoMes(clienteId, mesAtual, anoAtual);
  };

  const handlePagamentoMes = async (clienteId: string, mes: number, ano: number) => {
    if (!user) return;

    const pagamentoExistente = getPagamentoDoMes(clienteId, mes, ano);
    
    try {
      if (!pagamentoExistente) {
        // Primeiro clique: registrar pagamento (verde)
        const { error } = await supabase
          .from('pagamentos')
          .insert({
            cliente_id: clienteId,
            user_id: user?.id,
            mes: mes,
            ano: ano,
            status: 'pago'
          });
        
        if (error) throw error;
      } else {
        // Ciclar entre os status
        let novoStatus;
        switch (pagamentoExistente.status) {
          case 'pago':
            novoStatus = 'promocao'; // verde -> azul
            break;
          case 'promocao':
            novoStatus = 'removido'; // azul -> vermelho
            break;
          case 'removido':
            novoStatus = 'pago'; // vermelho -> verde
            break;
          default:
            novoStatus = 'pago';
        }
        
        const { error } = await supabase
          .from('pagamentos')
          .update({ status: novoStatus })
          .eq('id', pagamentoExistente.id);
        
        if (error) throw error;
      }
      
      // Não precisa mais fazer fetch manual - o realtime vai cuidar da atualização
      // O realtime vai disparar automaticamente notifyPagamentoUpdate quando detectar mudanças
      
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getPagamentoDoMes = (clienteId: string, mes: number, ano: number) => {
    return pagamentos.find(p => 
      p.cliente_id === clienteId && 
      p.mes === mes && 
      p.ano === ano
    );
  };

  return {
    pagamentos,
    getPagamentoMesAtual,
    getPagamentoDoMes,
    handlePagamento,
    handlePagamentoMes,
    fetchPagamentos,
    notifyPagamentoUpdate
  };
};