import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Plus, Info, Server, Smartphone, Monitor } from "lucide-react";
import { MissingDataItem } from "@/utils/dataValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface ImportApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingItems: MissingDataItem[];
  onApprove: (approvedItems: MissingDataItem[]) => void;
  onCancel: () => void;
}
export const ImportApprovalModal = ({
  open,
  onOpenChange,
  missingItems,
  onApprove,
  onCancel
}: ImportApprovalModalProps) => {
  const [editableItems, setEditableItems] = useState<MissingDataItem[]>([]);
  useEffect(() => {
    setEditableItems(missingItems.map(item => ({
      ...item,
      action: 'create'
    })));
  }, [missingItems]);
  const getTypeLabel = (type: string) => {
    const labels = {
      'servidor': 'Servidores',
      'aplicativo': 'Aplicativos',
      'dispositivo': 'Dispositivos'
    };
    return labels[type as keyof typeof labels] || type;
  };
  const getTypeIcon = (type: string) => {
    const icons = {
      'servidor': Server,
      'aplicativo': Monitor,
      'dispositivo': Smartphone
    };
    const Icon = icons[type as keyof typeof icons] || Monitor;
    return <Icon className="h-4 w-4" />;
  };
  const groupedItems = editableItems.reduce((acc, item, index) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push({
      ...item,
      index
    });
    return acc;
  }, {} as Record<string, (MissingDataItem & {
    index: number;
  })[]>);
  const handleApprove = () => {
    onApprove(editableItems);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Importar clientes e dados de cadastro
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-800">
                  Ao importar, foram encontrados <strong>{missingItems.length} dados</strong> que não 
                  existem nos <strong>Dados de Cadastro</strong>. Estes itens serão automaticamente 
                  cadastrados após confirmar a importação dos novos clientes.
                  
                  <div className="mt-3">
                    <h4 className="font-medium text-blue-900 text-sm mb-1">O que acontecerá:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-start gap-1">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Os <strong>{editableItems.length} itens</strong> abaixo serão cadastrados na página "Dados de Cadastro" em suas respectivas categorias</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>Os clientes da planilha serão importados normalmente</span>
                      </li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {Object.entries(groupedItems).map(([type, items]) => <div key={type} className="border rounded-lg p-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(type)}
                      <h3 className="font-medium text-gray-900 text-sm">
                        {getTypeLabel(type)}
                      </h3>
                      <Badge variant="secondary" className="text-xs h-5">
                        {items.length} novo{items.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {items.map(item => <div key={item.index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                          <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full flex-shrink-0">
                            <Plus className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {item.originalName}
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>)}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {editableItems.length} item{editableItems.length !== 1 ? 's' : ''} serão cadastrados
            </div>
            
            <div className="flex gap-2 order-1 sm:order-2">
              <Button variant="outline" onClick={onCancel} size="sm">
                Cancelar Importação
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" size="sm">
                Importar e Cadastrar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};