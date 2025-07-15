import { useState } from "react";
import { Plus, MessageSquare, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateModal } from "@/components/templates/TemplateModal";
import { TemplateFormModal } from "@/components/templates/TemplateFormModal";
import { toast } from "sonner";

const Templates = () => {
  const [open, setOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const handleCreate = async (data: any) => {
    try {
      await createTemplate(data);
      setOpen(false);
      toast.success('Template criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar template.');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTemplate(id, data);
      setEditTemplate(null);
      toast.success('Template atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar template.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast.success('Template excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir template.');
    }
  };

  const handleCopy = async (template: any) => {
    try {
      await createTemplate({
        nome: `${template.nome} (cópia)`,
        mensagem: template.mensagem
      });
      toast.success('Template copiado com sucesso!');
    } catch (error) {
      toast.error('Erro ao copiar template.');
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <TemplateModal open={open} setOpen={setOpen}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Template
          </Button>
        </TemplateModal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {template.nome}
                <Badge variant="secondary">
                  <MessageSquare className="mr-2 h-4 w-4" />
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground truncate">{template.mensagem}</p>
              <div className="flex justify-end space-x-2 mt-4">
                <TemplateFormModal
                  template={template}
                  open={!!editTemplate && editTemplate.id === template.id}
                  setOpen={() => setEditTemplate(template)}
                  onSubmit={handleUpdate}
                >
                  <Button variant="ghost" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </TemplateFormModal>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(template)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TemplateFormModal open={open} setOpen={setOpen} onSubmit={handleCreate} />
    </div>
  );
};

export default Templates;
