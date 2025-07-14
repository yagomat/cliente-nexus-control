
import { useState, useEffect } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
          className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white p-0"
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
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white p-0"
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
        className="w-10 h-10 border-red-300 hover:bg-red-50 p-0"
        onClick={() => handlePagamentoMes(clienteId, mes, ano)}
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    );
  };

  return (
    <div className="space-y-6 p-4">
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
      <div className="border rounded-lg">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 min-w-48">Cliente</TableHead>
                {mesesDoAno.map((mes) => (
                  <TableHead key={mes.numero} className="text-center w-20 min-w-20">
                    {mes.nome}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="w-48 min-w-48 font-medium">
                    {cliente.nome}
                  </TableCell>
                  {mesesDoAno.map((mes) => (
                    <TableCell key={`${cliente.id}-${mes.numero}`} className="text-center w-20 min-w-20">
                      {getStatusButton(cliente.id, mes.numero, anoSelecionado)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default PagamentosView;
