import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const usePagamentos = () => {
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchPagamentos();
    }
  }, [user]);

  const fetchPagamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPagamentos(data || []);
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
    
    const pagamentoExistente = getPagamentoMesAtual(clienteId);
    
    try {
      if (!pagamentoExistente) {
        // Primeiro clique: registrar pagamento (verde)
        const { error } = await supabase
          .from('pagamentos')
          .insert({
            cliente_id: clienteId,
            user_id: user?.id,
            mes: mesAtual,
            ano: anoAtual,
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
      
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return {
    pagamentos,
    getPagamentoMesAtual,
    handlePagamento,
    fetchPagamentos
  };
};