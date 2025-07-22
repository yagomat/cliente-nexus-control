
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClienteImportExport } from "@/hooks/useClienteImportExport";

interface ExportarClientesProps {
  clientes: any[];
}

export const ExportarClientes = ({ clientes }: ExportarClientesProps) => {
  const { exportarClientes, isExporting } = useClienteImportExport();

  const handleExport = () => {
    if (clientes.length === 0) {
      return;
    }
    exportarClientes(clientes);
  };

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2 flex-1 justify-center"
      onClick={handleExport}
      disabled={isExporting || clientes.length === 0}
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exportando..." : "Exportar Excel"}
    </Button>
  );
};
