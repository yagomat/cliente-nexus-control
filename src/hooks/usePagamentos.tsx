import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// Estado global para sincronização
let globalPagamentos: any[] = [];
let listeners: (() => void)[] = [];
let pagamentoUpdateListeners: (() => void)[] = [];

// Função para notificar sobre atualizações de pagamentos
const notifyPagamentoUpdate = () => {
  pagamentoUpdateListeners.forEach(listener => listener());
};

// Função para registrar listener de atualizações de pagamentos
export const addPagamentoUpdateListener = (listener: () => void) => {
  pagamentoUpdateListeners.push(listener);
  
  // Retorna função para remover o listener
  return () => {
    pagamentoUpdateListeners = pagamentoUpdateListeners.filter(l => l !== listener);
  };
};

export const usePagamentos = () => {
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<any[]>(globalPagamentos);
  
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
  }, [user]);

  const notifyAllListeners = () => {
    listeners.forEach(listener => listener());
  };

  const fetchPagamentos = async () => {
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
  };

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
      
      // Atualizar os dados
      await fetchPagamentos();
      
      // Notificar outros hooks que os pagamentos foram atualizados
      notifyPagamentoUpdate();
      
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