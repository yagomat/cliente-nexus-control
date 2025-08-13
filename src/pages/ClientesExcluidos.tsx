import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useClienteActions } from "@/hooks/useClienteActions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, RotateCcw, Search, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteExcluido {
  id: string;
  nome: string;
  telefone?: string;
  servidor: string;
  aplicativo: string;
  dia_vencimento: number;
  valor_plano?: number;
  deleted_at: string;
  created_at: string;
}

const ClientesExcluidos = () => {
  const { user } = useAuth();
  const { restoreCliente } = useClienteActions();
  const [clientesExcluidos, setClientesExcluidos] = useState<ClienteExcluido[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [restoringIds, setRestoringIds] = useState<Set<string>>(new Set());

  const fetchClientesExcluidos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, servidor, aplicativo, dia_vencimento, valor_plano, deleted_at, created_at')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      
      setClientesExcluidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes excluídos:', error);
      toast({
        title: "Erro ao carregar clientes excluídos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes excluídos ao montar o componente
  useEffect(() => {
    if (user) {
      fetchClientesExcluidos();
    }
  }, [user]);

  const clientesFiltrados = useMemo(() => {
    return clientesExcluidos.filter(cliente => {
      const matchBusca = busca === "" || 
        cliente.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.telefone?.includes(busca) ||
        cliente.servidor?.toLowerCase().includes(busca.toLowerCase());
      
      return matchBusca;
    });
  }, [clientesExcluidos, busca]);

  const handleRestoreCliente = async (clienteId: string) => {
    setRestoringIds(prev => new Set(prev).add(clienteId));
    
    try {
      const success = await restoreCliente(clienteId);
      if (success) {
        // Remove o cliente da lista após restauração bem-sucedida
        setClientesExcluidos(prev => prev.filter(cliente => cliente.id !== clienteId));
      }
    } finally {
      setRestoringIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(clienteId);
        return newSet;
      });
    }
  };

  const permanentDeleteCliente = async (clienteId: string) => {
    if (!user) return;

    if (!confirm("Tem certeza que deseja excluir permanentemente este cliente? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído permanentemente",
        description: "O cliente foi removido definitivamente do sistema.",
      });

      // Remove o cliente da lista
      setClientesExcluidos(prev => prev.filter(cliente => cliente.id !== clienteId));
    } catch (error) {
      console.error('Erro ao excluir cliente permanentemente:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes Excluídos</h1>
        <p className="text-muted-foreground">
          Gerencie clientes que foram excluídos. Você pode restaurá-los ou excluí-los permanentemente.
        </p>
      </div>

      {/* Barra de busca e estatísticas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou servidor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{clientesFiltrados.length} de {clientesExcluidos.length} clientes excluídos</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando clientes excluídos...</p>
        </div>
      ) : clientesExcluidos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Nenhum cliente excluído</p>
            <p className="text-muted-foreground">Não há clientes excluídos no momento.</p>
          </CardContent>
        </Card>
      ) : clientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Nenhum resultado encontrado</p>
            <p className="text-muted-foreground">Tente ajustar os termos da busca.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Excluído em {format(new Date(cliente.deleted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">Excluído</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {cliente.telefone && (
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <p className="font-medium">{cliente.telefone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Servidor:</span>
                    <p className="font-medium">{cliente.servidor}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aplicativo:</span>
                    <p className="font-medium">{cliente.aplicativo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vencimento:</span>
                    <p className="font-medium">Dia {cliente.dia_vencimento}</p>
                  </div>
                  {cliente.valor_plano && (
                    <div>
                      <span className="text-muted-foreground">Valor:</span>
                      <p className="font-medium">R$ {Number(cliente.valor_plano).toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Cliente desde:</span>
                    <p className="font-medium">
                      {format(new Date(cliente.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleRestoreCliente(cliente.id)}
                    disabled={restoringIds.has(cliente.id)}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoringIds.has(cliente.id) ? "Restaurando..." : "Restaurar Cliente"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => permanentDeleteCliente(cliente.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir Permanentemente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientesExcluidos;