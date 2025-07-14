import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PagamentosView = () => {
  const [mesAno, setMesAno] = useState(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const { clientes } = useClientes();
  const { pagamentos, fetchPagamentos } = usePagamentos();
  const { user } = useAuth();
  const { toast } = useToast();

  const [ano, mes] = mesAno.split('-').map(Number);

  const handlePagamentoMes = async (clienteId: string, status: 'pago' | 'promocao' | 'removido' | null) => {
    if (!user) return;

    try {
      if (status === null) {
        // Remover pagamento
        await supabase
          .from('pagamentos')
          .delete()
          .eq('cliente_id', clienteId)
          .eq('mes', mes)
          .eq('ano', ano)
          .eq('user_id', user.id);
      } else {
        // Inserir ou atualizar pagamento
        await supabase
          .from('pagamentos')
          .upsert({
            cliente_id: clienteId,
            user_id: user.id,
            mes,
            ano,
            status
          });
      }
      
      await fetchPagamentos();
      toast({
        title: "Pagamento atualizado",
        description: "O status do pagamento foi alterado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const getPagamentoDoMes = (clienteId: string) => {
    return pagamentos.find(p => 
      p.cliente_id === clienteId && 
      p.mes === mes && 
      p.ano === ano
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pago':
        return <Badge variant="default" className="bg-green-500">Pago</Badge>;
      case 'promocao':
        return <Badge variant="secondary">Promoção</Badge>;
      case 'removido':
        return <Badge variant="destructive">Removido</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  // Gerar opções de meses (6 meses anteriores e 6 futuros)
  const gerarOpcoesMeses = () => {
    const opcoes = [];
    const hoje = new Date();
    
    for (let i = -6; i <= 6; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      const valor = `${ano}-${String(mes).padStart(2, '0')}`;
      const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      opcoes.push({ valor, label });
    }
    
    return opcoes;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5" />
        <Select value={mesAno} onValueChange={setMesAno}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {gerarOpcoesMeses().map(opcao => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {clientes.map((cliente) => {
          const pagamento = getPagamentoDoMes(cliente.id);
          
          return (
            <Card key={cliente.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cliente.valor_plano && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        R$ {cliente.valor_plano}
                      </div>
                    )}
                    {getStatusBadge(pagamento?.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={pagamento?.status === 'pago' ? 'default' : 'outline'}
                    onClick={() => handlePagamentoMes(cliente.id, 'pago')}
                  >
                    Pago
                  </Button>
                  <Button
                    size="sm"
                    variant={pagamento?.status === 'promocao' ? 'default' : 'outline'}
                    onClick={() => handlePagamentoMes(cliente.id, 'promocao')}
                  >
                    Promoção
                  </Button>
                  <Button
                    size="sm"
                    variant={pagamento?.status === 'removido' ? 'destructive' : 'outline'}
                    onClick={() => handlePagamentoMes(cliente.id, 'removido')}
                  >
                    Removido
                  </Button>
                  {pagamento && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePagamentoMes(cliente.id, null)}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PagamentosView;