
import { useMemo } from "react";
import { usePagamentos } from "@/hooks/usePagamentos";
import { calcularStatusCliente } from "@/utils/clienteUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";

interface ClienteMatrixViewProps {
  clientes: any[];
  clientesFiltrados: any[];
}

export const ClienteMatrixView = ({ clientes, clientesFiltrados }: ClienteMatrixViewProps) => {
  const { getPagamentoDoMes, handlePagamentoMes } = usePagamentos();
  
  const meses = [
    { numero: 1, nome: "Jan" },
    { numero: 2, nome: "Fev" },
    { numero: 3, nome: "Mar" },
    { numero: 4, nome: "Abr" },
    { numero: 5, nome: "Mai" },
    { numero: 6, nome: "Jun" },
    { numero: 7, nome: "Jul" },
    { numero: 8, nome: "Ago" },
    { numero: 9, nome: "Set" },
    { numero: 10, nome: "Out" },
    { numero: 11, nome: "Nov" },
    { numero: 12, nome: "Dez" },
  ];

  const anoAtual = new Date().getFullYear();

  const getButtonStyle = (clienteId: string, mes: number) => {
    const pagamento = getPagamentoDoMes(clienteId, mes, anoAtual);
    
    if (!pagamento || pagamento.status === 'removido') {
      return { 
        variant: "outline" as const, 
        className: "w-8 h-8 p-0 border-red-200 hover:bg-red-50",
        icon: <X className="h-3 w-3 text-red-500" />
      };
    }
    
    if (pagamento.status === 'pago') {
      return { 
        variant: "default" as const, 
        className: "w-8 h-8 p-0 bg-green-500 hover:bg-green-600",
        icon: <Check className="h-3 w-3 text-white" />
      };
    }
    
    if (pagamento.status === 'promocao') {
      return { 
        variant: "default" as const, 
        className: "w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600",
        icon: <Check className="h-3 w-3 text-white" />
      };
    }
    
    return { 
      variant: "outline" as const, 
      className: "w-8 h-8 p-0 border-gray-200 hover:bg-gray-50",
      icon: <X className="h-3 w-3 text-gray-400" />
    };
  };

  const handlePagamentoClick = async (clienteId: string, mes: number) => {
    await handlePagamentoMes(clienteId, mes, anoAtual);
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background border-r min-w-[200px] max-w-[200px] font-semibold z-10">
                  Cliente
                </TableHead>
                {meses.map((mes) => (
                  <TableHead key={mes.numero} className="text-center w-[60px] min-w-[60px] font-semibold">
                    {mes.nome}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-muted/50">
                  <TableCell className="sticky left-0 bg-background border-r font-medium min-w-[200px] max-w-[200px] z-10">
                    <div className="flex flex-col">
                      <span className="font-semibold truncate">{cliente.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        Venc: {cliente.dia_vencimento}
                      </span>
                    </div>
                  </TableCell>
                  {meses.map((mes) => {
                    const buttonStyle = getButtonStyle(cliente.id, mes.numero);
                    return (
                      <TableCell key={mes.numero} className="text-center p-2 w-[60px] min-w-[60px]">
                        <Button
                          variant={buttonStyle.variant}
                          className={buttonStyle.className}
                          onClick={() => handlePagamentoClick(cliente.id, mes.numero)}
                          title={`${cliente.nome} - ${mes.nome}/${anoAtual}`}
                        >
                          {buttonStyle.icon}
                        </Button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {clientesFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </div>
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </div>
            <span>Promoção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-red-200 rounded flex items-center justify-center">
              <X className="h-2 w-2 text-red-500" />
            </div>
            <span>Não pago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
