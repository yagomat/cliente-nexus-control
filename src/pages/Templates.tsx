
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates } from "@/hooks/useTemplates";

import { TemplateFormModal } from "@/components/templates/TemplateFormModal";
import { toast } from "sonner";

const Templates = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [editTemplate, setEditTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      await createTemplate({
        nome: data.nome,
        mensagem: data.mensagem,
        tipo: data.tipo || "geral",
        is_default: data.is_default || false,
      });
      toast.success("Template criado com sucesso!");
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error("Erro ao criar template: " + error.message);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateTemplate(id, data);
      toast.success("Template atualizado com sucesso!");
      setEditModalOpen(false);
      setEditTemplate(null);
    } catch (error: any) {
      toast.error("Erro ao atualizar template: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast.success("Template excluído com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir template: " + error.message);
    }
  };


  const handleEdit = (template: any) => {
    setEditTemplate(template);
    setEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p>Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowCreateModal(true)}
          disabled={templates.length >= 10}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.mensagem}
              </p>
              <div className="flex justify-end items-center">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Edit Modal */}
      {editTemplate && (
        <TemplateFormModal
          template={editTemplate}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditTemplate(null);
          }}
          onSave={(data) => handleUpdate(editTemplate.id, data)}
        />
      )}

      {/* Create Modal */}
      <TemplateFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
      />
    </div>
  );
};

export default Templates;
