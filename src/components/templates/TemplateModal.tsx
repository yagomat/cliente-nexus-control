
import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { formatTemplate, formatForWhatsApp } = useTemplateFormatter();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [editableMessage, setEditableMessage] = useState<string>('');

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (selectedTemplate) {
      const formattedMessage = formatTemplate(selectedTemplate.mensagem, templateData);
      setEditableMessage(formattedMessage);
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
                    {template.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem Editável */}
          {selectedTemplate && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Mensagem:</label>
              <Textarea
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="min-h-[120px]"
              />
            </div>
          )}

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
