import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
interface ImportError {
  linha: number;
  campo: string;
  valor: string;
  erro: string;
}
interface ImportResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientesImportados: number;
  clientesRejeitados: number;
  erros: ImportError[];
  duplicados?: number;
}
export const ImportResultModal = ({
  open,
  onOpenChange,
  clientesImportados,
  clientesRejeitados,
  erros,
  duplicados = 0
}: ImportResultModalProps) => {
  const total = clientesImportados + clientesRejeitados + duplicados;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Resultado da Importação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center px-[8px] py-[8px]">
              <div className="text-2xl font-bold text-gray-700">{total}</div>
              <div className="text-sm text-gray-600">Clientes Processados</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center px-[8px] py-[8px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-green-700">{clientesImportados}</div>
              </div>
              <div className="text-sm text-green-600">Clientes Importados</div>
            </div>

            {duplicados > 0 && <div className="bg-yellow-50 p-4 rounded-lg text-center px-[8px] py-[8px]">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-700">{duplicados}</div>
                </div>
                <div className="text-sm text-yellow-600">Clientes Duplicados</div>
              </div>}

            <div className="bg-red-50 p-4 rounded-lg text-center px-[8px] py-[8px]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-red-700">{clientesRejeitados}</div>
              </div>
              <div className="text-sm text-red-600">Com Erro</div>
            </div>
          </div>

          {/* Detalhes dos erros */}
          {erros.length > 0 && <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Detalhes dos Erros ({erros.length})
              </h3>
              
              <ScrollArea className="max-h-[300px] border rounded-lg">
                <div className="space-y-2 p-4">
                  {erros.map((erro, index) => <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {erro.linha > 0 && <Badge variant="outline" className="text-xs">
                              Linha {erro.linha}
                            </Badge>}
                          <Badge variant="secondary" className="text-xs">
                            {erro.campo}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-900 font-medium">
                          {erro.erro}
                        </div>
                        {erro.valor && <div className="text-xs text-gray-600 mt-1">
                            Valor: "{erro.valor}"
                          </div>}
                      </div>
                    </div>)}
                </div>
              </ScrollArea>
            </div>}

          {/* Mensagem de sucesso */}
          {clientesImportados > 0 && erros.length === 0 && <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Importação concluída com sucesso! {clientesImportados} cliente{clientesImportados > 1 ? 's' : ''} importado{clientesImportados > 1 ? 's' : ''}.
                </span>
              </div>
            </div>}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};