
import { useMemo } from "react";
import { usePagamentos } from "@/hooks/usePagamentos";
import { calcularStatusCliente } from "@/utils/clienteUtils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import { ClientePagination } from "@/components/clientes/ClientePagination";
import { Check, X, Gift } from "lucide-react";

interface ClienteMatrixViewProps {
  clientes: any[];
  clientesFiltrados: any[];
  anoFiltro: number;
  currentPage: number;
  itemsPerPage: number;
}

export const ClienteMatrixView = ({ clientes, clientesFiltrados, anoFiltro, currentPage, itemsPerPage }: ClienteMatrixViewProps) => {
  const { getPagamentoDoMes, handlePagamentoMes } = usePagamentos();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
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

  // Paginação dos clientes
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

  const getButtonStyle = (clienteId: string, mes: number) => {
    const pagamento = getPagamentoDoMes(clienteId, mes, anoFiltro);
    
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
        icon: <Gift className="h-3 w-3 text-white" />
      };
    }
    
    return { 
      variant: "outline" as const, 
      className: "w-8 h-8 p-0 border-gray-200 hover:bg-gray-50",
      icon: <X className="h-3 w-3 text-gray-400" />
    };
  };

  const handlePagamentoClick = async (clienteId: string, mes: number) => {
    await handlePagamentoMes(clienteId, mes, anoFiltro);
  };

  // Calculate available width based on sidebar state
  const getMaxWidth = () => {
    if (typeof window === 'undefined') return 'calc(100vw - 2rem)';
    
    if (window.innerWidth < 768) {
      // Mobile: account for padding only
      return 'calc(100vw - 2rem)';
    }
    
    // Desktop: account for sidebar width
    const sidebarWidth = isCollapsed ? 64 : 240; // w-16 = 64px, w-60 = 240px
    const padding = 32; // 2rem = 32px
    return `calc(100vw - ${sidebarWidth + padding}px)`;
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="border rounded-md">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background border-r w-32 min-w-32 max-w-32 font-semibold z-20">
                  Cliente
                </TableHead>
                {meses.map((mes) => (
                  <TableHead key={mes.numero} className="text-center w-16 min-w-16 max-w-16 font-semibold">
                    <div className="flex flex-col">
                      <span>{mes.nome}</span>
                      <span className="text-xs text-muted-foreground font-normal">{anoFiltro}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesPaginados.map((cliente) => (
                <TableRow key={cliente.id} className="hover:bg-muted/50">
                  <TableCell className="sticky left-0 bg-background border-r font-medium w-32 min-w-32 max-w-32 z-10 p-2">
                    <div className="font-semibold text-xs leading-tight break-words" title={cliente.nome}>
                      {cliente.nome}
                    </div>
                  </TableCell>
                  {meses.map((mes) => {
                    const buttonStyle = getButtonStyle(cliente.id, mes.numero);
                    return (
                      <TableCell key={mes.numero} className="text-center p-2 w-16 min-w-16 max-w-16">
                        <Button
                          variant={buttonStyle.variant}
                          className={buttonStyle.className}
                          onClick={() => handlePagamentoClick(cliente.id, mes.numero)}
                          title={`${cliente.nome} - ${mes.nome}/${anoFiltro}`}
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
      </div>
      
      {clientesFiltrados.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      )}
      

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
              <Check className="h-2 w-2 text-white" />
            </div>
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
              <Gift className="h-2 w-2 text-white" />
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
