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
          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => handlePagamentoMes(clienteId, mes, ano)}
        >
          <Check className="h-4 w-4" />
        </Button>
      );
    }

    if (status === 'promocao') {
      return (
        <Button
          size="sm"
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => handlePagamentoMes(clienteId, mes, ano)}
        >
          <Check className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="w-12 h-12 border-red-300 hover:bg-red-50"
        onClick={() => handlePagamentoMes(clienteId, mes, ano)}
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    );
  };

  return (
    <div className="space-y-6">
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
      <div className="border rounded-lg overflow-hidden">
        <div className="flex">
          {/* Coluna fixa com nomes */}
          <div className="bg-muted/50 border-r w-48 flex-shrink-0">
            <div className="h-14 flex items-center justify-center border-b font-medium">
              Nome
            </div>
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="h-16 flex items-center px-4 border-b text-sm"
              >
                {cliente.nome}
              </div>
            ))}
          </div>

          {/* Colunas dos meses com scroll horizontal */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max">
              {mesesDoAno.map((mes) => (
                <div key={mes.numero} className="w-24 flex-shrink-0 border-r last:border-r-0">
                  <div className="h-14 flex items-center justify-center border-b font-medium bg-muted/50 text-xs">
                    {mes.nome}
                    <br />
                    {anoSelecionado}
                  </div>
                  {clientes.map((cliente) => (
                    <div
                      key={`${cliente.id}-${mes.numero}`}
                      className="h-16 flex items-center justify-center border-b"
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