import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Servidor {
  id: string;
  nome: string;
}

interface Aplicativo {
  id: string;
  nome: string;
}

interface Dispositivo {
  id: string;
  nome: string;
}

interface ValorPlano {
  id: string;
  valor: number;
}

export const useDadosCadastro = () => {
  const { user } = useAuth();
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [aplicativos, setAplicativos] = useState<Aplicativo[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [valoresPlano, setValoresPlano] = useState<ValorPlano[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [servidoresRes, aplicativosRes, dispositivosRes, valoresRes] = await Promise.all([
        supabase.from('servidores').select('*').eq('user_id', user.id).order('nome'),
        supabase.from('aplicativos').select('*').eq('user_id', user.id).order('nome'),
        supabase.from('dispositivos').select('*').eq('user_id', user.id).order('nome'),
        supabase.from('valores_plano').select('*').eq('user_id', user.id).order('valor')
      ]);

      if (servidoresRes.error) throw servidoresRes.error;
      if (aplicativosRes.error) throw aplicativosRes.error;
      if (dispositivosRes.error) throw dispositivosRes.error;
      if (valoresRes.error) throw valoresRes.error;

      setServidores(servidoresRes.data || []);
      setAplicativos(aplicativosRes.data || []);
      setDispositivos(dispositivosRes.data || []);
      setValoresPlano(valoresRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de cadastro:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add servidor
  const adicionarServidor = async (nome: string) => {
    if (!user || !nome.trim()) return;

    try {
      const { data, error } = await supabase
        .from('servidores')
        .insert([{ nome: nome.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setServidores(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({
        title: "Servidor adicionado",
        description: "Servidor adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar servidor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o servidor.",
        variant: "destructive",
      });
    }
  };

  // Remove servidor
  const removerServidor = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('servidores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setServidores(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Servidor removido",
        description: "Servidor removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover servidor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o servidor.",
        variant: "destructive",
      });
    }
  };

  // Add aplicativo
  const adicionarAplicativo = async (nome: string) => {
    if (!user || !nome.trim()) return;

    try {
      const { data, error } = await supabase
        .from('aplicativos')
        .insert([{ nome: nome.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setAplicativos(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({
        title: "Aplicativo adicionado",
        description: "Aplicativo adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar aplicativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aplicativo.",
        variant: "destructive",
      });
    }
  };

  // Remove aplicativo
  const removerAplicativo = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('aplicativos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAplicativos(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Aplicativo removido",
        description: "Aplicativo removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover aplicativo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o aplicativo.",
        variant: "destructive",
      });
    }
  };

  // Add dispositivo
  const adicionarDispositivo = async (nome: string) => {
    if (!user || !nome.trim()) return;

    try {
      const { data, error } = await supabase
        .from('dispositivos')
        .insert([{ nome: nome.trim(), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setDispositivos(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      toast({
        title: "Dispositivo adicionado",
        description: "Dispositivo adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o dispositivo.",
        variant: "destructive",
      });
    }
  };

  // Remove dispositivo
  const removerDispositivo = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('dispositivos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setDispositivos(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Dispositivo removido",
        description: "Dispositivo removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover dispositivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o dispositivo.",
        variant: "destructive",
      });
    }
  };

  // Add valor plano
  const adicionarValorPlano = async (valor: number) => {
    if (!user || isNaN(valor) || valor <= 0) return;

    try {
      const { data, error } = await supabase
        .from('valores_plano')
        .insert([{ valor, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setValoresPlano(prev => [...prev, data].sort((a, b) => a.valor - b.valor));
      toast({
        title: "Valor adicionado",
        description: "Valor do plano adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o valor.",
        variant: "destructive",
      });
    }
  };

  // Remove valor plano
  const removerValorPlano = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('valores_plano')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setValoresPlano(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Valor removido",
        description: "Valor do plano removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover valor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o valor.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  return {
    servidores,
    aplicativos,
    dispositivos,
    valoresPlano,
    loading,
    adicionarServidor,
    removerServidor,
    adicionarAplicativo,
    removerAplicativo,
    adicionarDispositivo,
    removerDispositivo,
    adicionarValorPlano,
    removerValorPlano,
    refetch: fetchAllData,
  };
};