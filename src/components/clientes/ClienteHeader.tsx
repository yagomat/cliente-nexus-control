
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportarClientes } from "./ExportarClientes";
import { ImportarClientes } from "./ImportarClientes";

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

      <p className="text-sm text-muted-foreground mb-4">
        Exportar: Baixa todos os clientes em Excel<br/>
        Importar: Arquivo deve ter as colunas na ordem: Data cadastro, Nome, UF, Telefone, Servidor, Dia vencimento, Valor plano, Dispositivo 1, App 1, Usuário 1, Senha 1, Vencimento licença 1, Dispositivo 2, App 2, Usuário 2, Senha 2, Vencimento licença 2, Observações
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
