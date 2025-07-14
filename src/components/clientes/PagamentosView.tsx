
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
    <div className="space-y-6 max-w-full">
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
          {/* Coluna fixa com nomes dos clientes */}
          <div className="bg-muted/50 border-r flex-shrink-0" style={{ minWidth: '200px' }}>
            {/* Cabeçalho da coluna de nomes */}
            <div className="h-12 flex items-center justify-center border-b font-medium bg-muted/50 px-4">
              Cliente
            </div>
            {/* Lista de clientes */}
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className="h-12 flex items-center px-4 border-b text-sm"
                style={{ minWidth: '200px' }}
              >
                <span className="truncate" title={cliente.nome}>
                  {cliente.nome}
                </span>
              </div>
            ))}
          </div>

          {/* Área dos meses com scroll horizontal */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex" style={{ minWidth: '960px' }}>
              {mesesDoAno.map((mes) => (
                <div key={mes.numero} className="border-r last:border-r-0" style={{ minWidth: '80px' }}>
                  {/* Cabeçalho do mês */}
                  <div className="h-12 flex items-center justify-center border-b font-medium bg-muted/50 text-xs px-2">
                    <div className="text-center leading-tight">
                      {mes.nome.substring(0, 3)}
                    </div>
                  </div>
                  {/* Botões de pagamento para cada cliente */}
                  {clientes.map((cliente) => (
                    <div
                      key={`${cliente.id}-${mes.numero}`}
                      className="h-12 flex items-center justify-center border-b"
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
