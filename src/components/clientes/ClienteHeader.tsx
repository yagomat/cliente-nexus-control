
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportarClientes } from "./ExportarClientes";
import { ImportarClientes } from "./ImportarClientes";
import { ImportExportInfoModal } from "./ImportExportInfoModal";

interface ClienteHeaderProps {
  clientes?: any[];
  onImportComplete?: () => void;
}

export const ClienteHeader = ({ clientes = [], onImportComplete }: ClienteHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Botões de Export/Import - ocupando toda a largura em mobile */}
      <div className="flex gap-3 mb-4 w-full">
        <ExportarClientes clientes={clientes} />
        <ImportarClientes onImportComplete={onImportComplete || (() => {})} />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm text-muted-foreground">
          Informações sobre exportação / importação
        </p>
        <ImportExportInfoModal />
      </div>

      {/* Botão Novo Cliente */}
      <Link to="/clientes/novo">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-6">
          <Users className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </Link>
    </div>
  );
};
