
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    setEditableItems(missingItems.map(item => ({ ...item, action: 'create' })));
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
    acc[item.type].push({ ...item, index });
    return acc;
  }, {} as Record<string, (MissingDataItem & { index: number })[]>);

  const handleApprove = () => {
    onApprove(editableItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Dados Não Cadastrados Encontrados
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              Durante a importação, foram encontrados <strong>{missingItems.length} itens</strong> que não 
              existem em sua página de <strong>Dados de Cadastro</strong>. Estes itens serão automaticamente 
              cadastrados nas tabelas correspondentes antes de importar os clientes.
            </AlertDescription>
          </Alert>

          <ScrollArea className="flex-1 max-h-[400px]">
            <div className="space-y-4 pr-4">
              {Object.entries(groupedItems).map(([type, items]) => (
                <div key={type} className="border rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <h3 className="font-semibold text-gray-900">
                        {getTypeLabel(type)}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {items.length} novo{items.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {items.map((item) => (
                      <div key={item.index} className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full flex-shrink-0">
                          <Plus className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {item.originalName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Será cadastrado na página "Dados de Cadastro"
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">
                          Cadastrar
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-2">O que acontecerá:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Os <strong>{editableItems.length} itens</strong> acima serão cadastrados na página "Dados de Cadastro"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Os clientes da planilha serão importados normalmente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Clientes duplicados serão rejeitados automaticamente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {editableItems.length} item{editableItems.length !== 1 ? 's' : ''} será{editableItems.length !== 1 ? 'ão' : ''} cadastrado{editableItems.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-3 order-1 sm:order-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar Importação
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Cadastrar e Continuar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
