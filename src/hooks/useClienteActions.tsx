import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const useClienteActions = () => {
  const { user } = useAuth();

  const softDeleteCliente = async (clienteId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clientes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', clienteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cliente removido com sucesso",
        description: "O cliente foi removido mas seus dados foram preservados.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const restoreCliente = async (clienteId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('clientes')
        .update({ deleted_at: null })
        .eq('id', clienteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cliente restaurado com sucesso",
        description: "O cliente foi restaurado com todos os seus dados.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao restaurar cliente:', error);
      toast({
        title: "Erro ao restaurar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    softDeleteCliente,
    restoreCliente
  };
};