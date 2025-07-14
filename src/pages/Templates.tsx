import { useState } from "react";
import { MessageSquare, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useTemplates } from "@/hooks/useTemplates";
import { useTemplateFormatter } from "@/hooks/useTemplateFormatter";
import { TemplateFormModal } from "@/components/templates/TemplateFormModal";

const Templates = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { availableVariables } = useTemplateFormatter();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

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

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  const handleSave = async (templateData: any) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, templateData);
    } else {
      await createTemplate(templateData);
    }
    setEditingTemplate(null);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates WhatsApp</h1>
          <p className="text-muted-foreground">Gerencie mensagens predefinidas para WhatsApp</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsFormModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge {...getTipoBadge(template.tipo)}>
                        {getTipoBadge(template.tipo).label}
                      </Badge>
                      {template.is_default && (
                        <Badge variant="outline">Padrão</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!template.is_default && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o template <strong>{template.nome}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Mensagem:</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{template.mensagem}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Variáveis disponíveis:</h4>
                  <div className="flex flex-wrap gap-1">
                    {availableVariables.slice(0, 6).map((variable) => (
                      <Badge key={variable.key} variant="secondary" className="text-xs">
                        {variable.key}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(template)}>
                    Editar Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Variáveis Disponíveis</CardTitle>
          <CardDescription>Use essas variáveis em seus templates para personalizar as mensagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableVariables.map((variable) => (
              <div key={variable.key} className="flex justify-between">
                <Badge variant="secondary">{variable.key}</Badge>
                <span className="text-sm text-muted-foreground">{variable.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <TemplateFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        template={editingTemplate}
      />
    </div>
  );
};

export default Templates;