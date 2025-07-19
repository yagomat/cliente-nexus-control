
import { useState, useEffect } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, X, Check, Gift } from "lucide-react";

const PagamentosView = () => {
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual);
  
  const { clientes } = useClientes();
  const { handlePagamentoMes, getPagamentoDoMes } = usePagamentos();

  // Reset para ano e mês atual quando o componente for desmontado
  useEffect(() => {
    return () => {
      setAnoSelecionado(anoAtual);
      setMesSelecionado(mesAtual);
    };
  }, [anoAtual, mesAtual]);

  // Gerar opções de anos (4 anos para trás e 4 para frente)
  const gerarOpcoesAnos = () => {
    const opcoes = [];
    for (let i = -4; i <= 4; i++) {
      opcoes.push(anoAtual + i);
    }
    return opcoes;
  };

  // Opções de meses
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

  const getStatusButton = (clienteId: string) => {
    const pagamento = getPagamentoDoMes(clienteId, mesSelecionado, anoSelecionado);
    const status = pagamento?.status;

    if (status === 'pago') {
      return (
        <Button
          size="sm"
          className="w-24 h-8 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => handlePagamentoMes(clienteId, mesSelecionado, anoSelecionado)}
        >
          <Check className="h-4 w-4 mr-1" />
          Pago
        </Button>
      );
    }

    if (status === 'promocao') {
      return (
        <Button
          size="sm"
          className="w-24 h-8 bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => handlePagamentoMes(clienteId, mesSelecionado, anoSelecionado)}
        >
          <Gift className="h-4 w-4 mr-1" />
          Promoção
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="w-24 h-8 border-red-300 hover:bg-red-50"
        onClick={() => handlePagamentoMes(clienteId, mesSelecionado, anoSelecionado)}
      >
        <X className="h-4 w-4 mr-1 text-red-500" />
        Pendente
      </Button>
    );
  };

  const mesNome = mesesDoAno.find(m => m.numero === mesSelecionado)?.nome || '';

  return (
    <div className="space-y-6">
      {/* Filtros de Mês e Ano */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5" />
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Mês:</label>
          <Select value={mesSelecionado.toString()} onValueChange={(valor) => setMesSelecionado(parseInt(valor))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mesesDoAno.map(mes => (
                <SelectItem key={mes.numero} value={mes.numero.toString()}>
                  {mes.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Ano:</label>
          <Select value={anoSelecionado.toString()} onValueChange={(valor) => setAnoSelecionado(parseInt(valor))}>
            <SelectTrigger className="w-24">
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
      </div>

      {/* Tabela de Pagamentos */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Nome do Cliente</TableHead>
              <TableHead className="w-1/3 text-center">
                {mesNome} {anoSelecionado}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">
                    {cliente.nome}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusButton(cliente.id)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Explicativo dos botões */}
      <div className="flex justify-center items-center gap-6 p-4 bg-muted/50 rounded-lg border text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span>Pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <Gift className="h-3 w-3 text-white" />
          </div>
          <span>Promoção</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-red-300 rounded flex items-center justify-center">
            <X className="h-3 w-3 text-red-500" />
          </div>
          <span>Não pago</span>
        </div>
      </div>
    </div>
  );
};

export default PagamentosView;
