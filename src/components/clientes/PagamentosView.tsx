import { useState, useEffect } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PagamentosView = () => {
  const anoAtual = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  
  const { clientes } = useClientes();
  const { pagamentos, fetchPagamentos } = usePagamentos();
  const { user } = useAuth();
  const { toast } = useToast();

  // Reset para ano atual quando o componente for desmontado
  useEffect(() => {
    return () => {
      setAnoSelecionado(anoAtual);
    };
  }, [anoAtual]);

  const handlePagamentoMes = async (clienteId: string, mes: number, ano: number, status: 'pago' | 'promocao' | 'removido' | null) => {
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

  const getPagamentoDoMes = (clienteId: string, mes: number, ano: number) => {
    return pagamentos.find(p => 
      p.cliente_id === clienteId && 
      p.mes === mes && 
      p.ano === ano
    );
  };

  // Gerar opções de anos (4 anos para trás e 4 para frente)
  const gerarOpcoesAnos = () => {
    const opcoes = [];
    for (let i = -4; i <= 4; i++) {
      opcoes.push(anoAtual + i);
    }
    return opcoes;
  };

  // Gerar meses do ano
  const mesesDoAno = [
    { numero: 1, nome: 'Janeiro' },
    { numero: 2, nome: 'Fevereiro' },
    { numero: 3, nome: 'Março' },
    { numero: 4, nome: 'Abril' },
    { numero: 5, nome: 'Maio' },
    { numero: 6, nome: 'Junho' },
    { numero: 7, nome: 'Julho' },
    { numero: 8, nome: 'Agosto' },
    { numero: 9, nome: 'Setembro' },
    { numero: 10, nome: 'Outubro' },
    { numero: 11, nome: 'Novembro' },
    { numero: 12, nome: 'Dezembro' },
  ];

  const getStatusButton = (clienteId: string, mes: number, ano: number) => {
    const pagamento = getPagamentoDoMes(clienteId, mes, ano);
    const status = pagamento?.status;

    if (status === 'pago') {
      return (
        <Button
          size="sm"
          className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white p-0"
          onClick={() => handlePagamentoMes(clienteId, mes, ano, null)}
        >
          <Check className="h-3 w-3" />
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="w-6 h-6 border-red-300 hover:bg-red-50 p-0"
        onClick={() => handlePagamentoMes(clienteId, mes, ano, 'pago')}
      >
        <X className="h-3 w-3 text-red-500" />
      </Button>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Filtro de Ano */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5" />
        <Select value={anoSelecionado.toString()} onValueChange={(valor) => setAnoSelecionado(parseInt(valor))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {gerarOpcoesAnos().map(ano => (
              <SelectItem key={ano} value={ano.toString()}>
                {ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="w-full max-w-full border rounded-lg overflow-hidden">
        <div className="flex w-full">
          {/* Coluna fixa com nomes */}
          <div className="bg-muted/50 border-r w-32 flex-shrink-0 min-w-0">
            <div className="h-10 flex items-center justify-center border-b font-medium text-xs">
              Nome
            </div>
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="h-10 flex items-center px-1 border-b text-xs truncate"
              >
                {cliente.nome}
              </div>
            ))}
          </div>

          {/* Colunas dos meses com scroll horizontal */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <div className="flex w-max">
              {mesesDoAno.map((mes) => (
                <div key={mes.numero} className="w-12 flex-shrink-0 border-r last:border-r-0">
                  <div className="h-10 flex items-center justify-center border-b font-medium bg-muted/50 text-xs">
                    {mes.nome.slice(0, 3)}
                  </div>
                  {clientes.map((cliente) => (
                    <div
                      key={`${cliente.id}-${mes.numero}`}
                      className="h-10 flex items-center justify-center border-b"
                    >
                      {getStatusButton(cliente.id, mes.numero, anoSelecionado)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagamentosView;