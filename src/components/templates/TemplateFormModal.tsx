import { useState, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTemplateFormatter } from '@/hooks/useTemplateFormatter';
import { Template } from '@/hooks/useTemplates';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  template?: Template;
}

export const TemplateFormModal = ({ isOpen, onClose, onSave, template }: TemplateFormModalProps) => {
  const { availableVariables } = useTemplateFormatter();
  const [formData, setFormData] = useState({
    nome: '',
    mensagem: '',
    is_default: false
  });

  useEffect(() => {
    if (template) {
      setFormData({
        nome: template.nome,
        mensagem: template.mensagem,
        is_default: template.is_default
      });
    } else {
      setFormData({
        nome: '',
        mensagem: '',
        is_default: false
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({ ...formData, tipo: 'personalizado' });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('mensagem') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.mensagem;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setFormData(prev => ({ ...prev, mensagem: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Template</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Cobrança Padrão"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
              placeholder="Digite sua mensagem usando as variáveis disponíveis..."
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Variáveis Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <div key={variable.key} className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={() => insertVariable(variable.key)}
                    >
                      {variable.key}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {variable.description}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Clique nas variáveis para inseri-las na mensagem
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {template ? 'Salvar Alterações' : 'Criar Template'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};