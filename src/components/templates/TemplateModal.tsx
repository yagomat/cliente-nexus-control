import { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplates } from '@/hooks/useTemplates';
import { useTemplateFormatter, TemplateData } from '@/hooks/useTemplateFormatter';
import { toast } from '@/hooks/use-toast';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateData: TemplateData;
}

export const TemplateModal = ({ isOpen, onClose, templateData }: TemplateModalProps) => {
  const { templates, loading } = useTemplates();
  const { formatTemplate, formatForWhatsApp, availableVariables } = useTemplateFormatter();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [editableMessage, setEditableMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (selectedTemplate) {
      const formattedMessage = formatTemplate(selectedTemplate.mensagem, templateData);
      setEditableMessage(formattedMessage);
      setIsEditing(false);
    }
  }, [selectedTemplate, templateData, formatTemplate]);

  const handleSendWhatsApp = () => {
    if (!editableMessage.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const whatsappUrl = formatForWhatsApp(editableMessage, templateData.cliente.telefone);
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const getTipoBadge = (tipo: string) => {
    const types = {
      a_vencer: { label: "A Vencer", variant: "default" as const },
      vence_hoje: { label: "Vence Hoje", variant: "destructive" as const },
      vencido: { label: "Vencido", variant: "destructive" as const },
      pago: { label: "Pago", variant: "secondary" as const },
      cobranca: { label: "Cobrança", variant: "destructive" as const },
      renovacao: { label: "Renovação", variant: "default" as const },
      boas_vindas: { label: "Boas-vindas", variant: "secondary" as const },
      lembrete: { label: "Lembrete", variant: "outline" as const }
    };
    return types[tipo as keyof typeof types] || { label: tipo, variant: "outline" as const };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enviar Mensagem WhatsApp - {templateData.cliente.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Template */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Selecione um template:</label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.nome}</span>
                      <Badge {...getTipoBadge(template.tipo)} className="text-xs">
                        {getTipoBadge(template.tipo).label}
                      </Badge>
                      {template.is_default && (
                        <Badge variant="outline" className="text-xs">Padrão</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview da Mensagem */}
          {selectedTemplate && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mensagem:</label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 px-2"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>

              {isEditing ? (
                <Textarea
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[120px]"
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{editableMessage}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Variáveis Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <div key={variable.key} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {variable.key}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {variable.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSendWhatsApp}
              disabled={!selectedTemplate || !editableMessage.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};