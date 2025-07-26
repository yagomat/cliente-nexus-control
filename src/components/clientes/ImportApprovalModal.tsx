
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            Dados Não Cadastrados Encontrados
          </DialogTitle>
        </DialogHeader>

        <Alert className="flex-shrink-0 mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Durante a importação, foram encontrados <strong>{missingItems.length} itens</strong> que não 
            existem em sua página de Dados de Cadastro. Estes itens serão automaticamente cadastrados 
            nas tabelas correspondentes antes de importar os clientes.
          </AlertDescription>
        </Alert>

        <ScrollArea className="flex-1 min-h-0 pr-2">
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([type, items], groupIndex) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-medium px-2 py-1">
                    {getTypeLabel(type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {items.length} novo{items.length > 1 ? 's' : ''} item{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border border-muted">
                      <Plus className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          "{item.originalName}"
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Será cadastrado em {getTypeLabel(item.type)}s
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                        Novo
                      </Badge>
                    </div>
                  ))}
                </div>

                {groupIndex < Object.keys(groupedItems).length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 bg-blue-50 p-3 rounded-md mt-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>O que acontecerá:</strong>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs">
                <li>Os {editableItems.length} itens acima serão cadastrados na página "Dados de Cadastro"</li>
                <li>Os clientes da planilha serão importados normalmente</li>
                <li>Clientes duplicados serão rejeitados automaticamente</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 pt-4">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">
            {editableItems.length} novo{editableItems.length > 1 ? 's' : ''} item{editableItems.length > 1 ? 's' : ''} 
            será{editableItems.length > 1 ? 'ão' : ''} cadastrado{editableItems.length > 1 ? 's' : ''}
          </div>
          
          <div className="flex gap-2 order-1 sm:order-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancelar Importação
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" size="sm">
              Cadastrar e Continuar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
