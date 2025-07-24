
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ImportExportInfoModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informações sobre Exportação/Importação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Exportação</h3>
            <p className="text-sm text-muted-foreground">
              Baixa todos os clientes em formato Excel (.xlsx) com todas as informações cadastradas.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Importação</h3>
            <p className="text-sm text-muted-foreground mb-3">
              O arquivo Excel deve conter as colunas na seguinte ordem:
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Data de cadastro</li>
                <li>Nome</li>
                <li>UF</li>
                <li>Telefone</li>
                <li>Servidor</li>
                <li>Dia de vencimento</li>
                <li>Valor do plano</li>
                <li>Dispositivo 1</li>
                <li>App 1</li>
                <li>Usuário 1</li>
                <li>Senha 1</li>
                <li>Vencimento licença 1</li>
                <li>Dispositivo 2</li>
                <li>App 2</li>
                <li>Usuário 2</li>
                <li>Senha 2</li>
                <li>Vencimento licença 2</li>
                <li>Observações</li>
              </ol>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dica importante</h4>
            <p className="text-sm text-blue-800">
              Para obter o formato correto da planilha, recomendamos primeiro 
              <strong> exportar uma planilha de exemplo</strong> com os clientes existentes. 
              Isso garantirá que você tenha a estrutura exata de colunas necessária para importação.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
