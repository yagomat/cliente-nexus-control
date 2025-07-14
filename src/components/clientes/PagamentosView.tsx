
import { useState, useEffect } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, X, Check } from "lucide-react";

const PagamentosView = () => {
  const anoAtual = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  
  const { clientes } = useClientes();
  const { handlePagamentoMes, getPagamentoDoMes } = usePagamentos();

  // Reset para ano atual quando o componente for desmontado
  useEffect(() => {
    return () => {
      setAnoSelecionado(anoAtual);
    };
  }, [anoAtual]);

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
    { numero: 1, nome: 'Jan' },
    { numero: 2, nome: 'Fev' },
    { numero: 3, nome: 'Mar' },
    { numero: 4, nome: 'Abr' },
    { numero: 5, nome: 'Mai' },
    { numero: 6, nome: 'Jun' },
    { numero: 7, nome: 'Jul' },
    { numero: 8, nome: 'Ago' },
    { numero: 9, nome: 'Set' },
    { numero: 10, nome: 'Out' },
    { numero: 11, nome: 'Nov' },
    { numero: 12, nome: 'Dez' },
  ];

  const getStatusButton = (clienteId: string, mes: number, ano: number) => {
    const pagamento = getPagamentoDoMes(clienteId, mes, ano);
    const status = pagamento?.status;

    if (status === 'pago') {
      return (
        <Button
          size="sm"
          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white p-0"
          onClick={() => handlePagamentoMes(clienteId, mes, ano)}
        >
          <Check className="h-3 w-3" />
        </Button>
      );
    }

    if (status === 'promocao') {
      return (
        <Button
          size="sm"
          className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white p-0"
          onClick={() => handlePagamentoMes(clienteId, mes, ano)}
        >
          <Check className="h-3 w-3" />
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="w-8 h-8 border-red-300 hover:bg-red-50 p-0"
        onClick={() => handlePagamentoMes(clienteId, mes, ano)}
      >
        <X className="h-3 w-3 text-red-500" />
      </Button>
    );
  };

  return (
    <div className="space-y-6 p-4 w-full max-w-full">
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

      {/* Tabela de Pagamentos - Layout Responsivo */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-full">
          {/* Cabeçalho da Tabela */}
          <div className="border rounded-lg bg-white">
            <div className="grid grid-cols-13 gap-1 p-3 bg-muted/50 border-b font-medium text-sm">
              <div className="col-span-1 text-left">Nome</div>
              {mesesDoAno.map((mes) => (
                <div key={mes.numero} className="col-span-1 text-center">
                  {mes.nome}
                </div>
              ))}
            </div>

            {/* Linhas dos Clientes */}
            <div className="divide-y">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="grid grid-cols-13 gap-1 p-3 items-center hover:bg-muted/30">
                  <div className="col-span-1 font-medium text-sm truncate pr-2">
                    {cliente.nome}
                  </div>
                  {mesesDoAno.map((mes) => (
                    <div key={`${cliente.id}-${mes.numero}`} className="col-span-1 flex justify-center">
                      {getStatusButton(cliente.id, mes.numero, anoSelecionado)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {clientes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default PagamentosView;
