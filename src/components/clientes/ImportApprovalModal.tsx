
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Plus, ArrowRight } from "lucide-react";
import { MissingDataItem, SimilarItem } from "@/utils/dataValidation";

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
  const [editableItems, setEditableItems] = useState<MissingDataItem[]>(missingItems);

  const updateItemAction = (index: number, action: MissingDataItem['action'], selectedExisting?: string) => {
    setEditableItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, action, selectedExisting } 
        : item
    ));
  };

  const updateItemName = (index: number, normalizedName: string) => {
    setEditableItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, normalizedName } 
        : item
    ));
  };

  const handleApprove = () => {
    const itemsToCreate = editableItems.filter(item => item.action === 'create');
    const itemsToUseExisting = editableItems.filter(item => item.action === 'use_existing');
    
    console.log('Itens para criar:', itemsToCreate);
    console.log('Itens para usar existentes:', itemsToUseExisting);
    
    onApprove(editableItems);
  };

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

  const totalItemsToCreate = editableItems.filter(item => item.action === 'create').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Itens Não Cadastrados Encontrados
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-4">
          Durante a importação, foram encontrados <strong>{missingItems.length} itens</strong> que não 
          existem em sua base de dados. Escolha como proceder com cada um:
        </div>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([type, items]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{getTypeLabel(type)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4 ml-4">
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="font-medium">
                        "{item.originalName}"
                      </div>

                      <RadioGroup
                        value={item.action}
                        onValueChange={(value: MissingDataItem['action']) => 
                          updateItemAction(item.index, value)
                        }
                      >
                        {/* Opção de criar novo */}
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="create" id={`create-${item.index}`} />
                          <div className="grid gap-2 flex-1">
                            <Label htmlFor={`create-${item.index}`} className="flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              Cadastrar como novo
                            </Label>
                            {item.action === 'create' && (
                              <Input
                                value={item.normalizedName}
                                onChange={(e) => updateItemName(item.index, e.target.value)}
                                placeholder="Nome para cadastrar"
                                className="ml-5"
                              />
                            )}
                          </div>
                        </div>

                        {/* Opção de usar item existente similar */}
                        {item.suggestedItems.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="use_existing" id={`existing-${item.index}`} />
                            <div className="grid gap-2 flex-1">
                              <Label htmlFor={`existing-${item.index}`} className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                Usar item existente similar
                              </Label>
                              {item.action === 'use_existing' && (
                                <RadioGroup
                                  value={item.selectedExisting}
                                  onValueChange={(value) => 
                                    updateItemAction(item.index, 'use_existing', value)
                                  }
                                  className="ml-5"
                                >
                                  {item.suggestedItems.map((similar) => (
                                    <div key={similar.id} className="flex items-center space-x-2">
                                      <RadioGroupItem 
                                        value={similar.id} 
                                        id={`similar-${item.index}-${similar.id}`} 
                                      />
                                      <Label 
                                        htmlFor={`similar-${item.index}-${similar.id}`}
                                        className="flex items-center gap-2"
                                      >
                                        {similar.nome}
                                        <Badge variant="secondary" className="text-xs">
                                          {Math.round(similar.similarity * 100)}% similar
                                        </Badge>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Opção de pular */}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="skip" id={`skip-${item.index}`} />
                          <Label htmlFor={`skip-${item.index}`}>
                            Pular este item (não importar clientes com este valor)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                {Object.keys(groupedItems).length > 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {totalItemsToCreate > 0 && (
              <span>{totalItemsToCreate} novo{totalItemsToCreate > 1 ? 's' : ''} item{totalItemsToCreate > 1 ? 's' : ''} será{totalItemsToCreate > 1 ? 'ão' : ''} cadastrado{totalItemsToCreate > 1 ? 's' : ''}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleApprove}>
              Continuar Importação
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
