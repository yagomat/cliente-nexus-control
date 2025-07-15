
import { Link } from "react-router-dom";
import { Users, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ClienteHeader = () => {
  return (
    <div className="mb-6">
      {/* Botões de Export/Import */}
      <div className="flex gap-3 mb-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Informações sobre exportação / Importação
      </p>

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
