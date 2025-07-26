
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Plus, Info } from "lucide-react";
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
      'servidor': 'Servidor',
      'aplicativo': 'Aplicativo',
      'dispositivo': 'Dispositivo'
    };
    return labels[type as keyof typeof labels] || type;
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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Dados Não Cadastrados Encontrados
          </DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Durante a importação, foram encontrados <strong>{missingItems.length} itens</strong> que não 
            existem em sua página de Dados de Cadastro. Estes itens serão automaticamente cadastrados 
            nas tabelas correspondentes antes de importar os clientes.
          </AlertDescription>
        </Alert>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([type, items]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-sm font-medium">
                    {getTypeLabel(type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {items.length} novo{items.length > 1 ? 's' : ''} item{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 ml-4 border-l-2 border-gray-100 pl-4">
                  {items.map((item) => (
                    <div key={item.index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          "{item.originalName}"
                        </div>
                        <div className="text-sm text-gray-600">
                          Será cadastrado em {getTypeLabel(item.type)}s
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Novo
                      </Badge>
                    </div>
                  ))}
                </div>

                {Object.keys(groupedItems).length > 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>O que acontecerá:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Os {editableItems.length} itens acima serão automaticamente cadastrados na página "Dados de Cadastro"</li>
                <li>Os clientes da planilha serão importados normalmente</li>
                <li>Clientes duplicados (com todas as informações iguais) serão rejeitados automaticamente</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {editableItems.length} novo{editableItems.length > 1 ? 's' : ''} item{editableItems.length > 1 ? 's' : ''} 
            será{editableItems.length > 1 ? 'ão' : ''} cadastrado{editableItems.length > 1 ? 's' : ''}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar Importação
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Cadastrar e Continuar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
