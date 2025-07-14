import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Eye, Edit, MessageCircle, Trash2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calcularVencimentoInteligente, calcularStatusCliente, getButtonVariantAndColor, getVencimentoColor } from "@/utils/clienteUtils";
import { ClienteViewModal } from "./ClienteViewModal";

interface ClienteCardProps {
  cliente: any;
  getPagamentoMesAtual: (clienteId: string) => any;
  getPagamentoDoMes?: (clienteId: string, mes: number, ano: number) => any;
  onPagamento: (clienteId: string) => void;
  onClienteDeleted: () => void;
}

export const ClienteCard = ({ cliente, getPagamentoMesAtual, getPagamentoDoMes, onPagamento, onClienteDeleted }: ClienteCardProps) => {
  const navigate = useNavigate();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Calcular informações inteligentes de vencimento
  const vencimentoInfo = getPagamentoDoMes ? calcularVencimentoInteligente(cliente, getPagamentoDoMes) : null;
  const clienteAtivo = getPagamentoDoMes ? calcularStatusCliente(cliente, getPagamentoDoMes) : false;
  const buttonConfig = getButtonVariantAndColor(cliente.id, getPagamentoMesAtual);
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Check":
        return Check;
      case "X":
        return X;
      default:
        return X;
    }
  };
  
  const IconComponent = getIconComponent(buttonConfig.icon);

  const handleEdit = () => {
    navigate(`/clientes/editar/${cliente.id}`);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', cliente.id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });

      onClienteDeleted();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card key={cliente.id} className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
        <Badge className={clienteAtivo ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
          {clienteAtivo ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">📞</span>
          <span>{cliente.telefone || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Dia {cliente.dia_vencimento}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">💻</span>
          <span>{cliente.servidor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {vencimentoInfo ? (
            <span className={getVencimentoColor(vencimentoInfo.vencido ? -Math.abs(vencimentoInfo.dias) : vencimentoInfo.dias)}>
              {vencimentoInfo.texto}
            </span>
          ) : (
            <span className="text-muted-foreground">Sem informação</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Botão de Pagamento */}
        <Button 
          size="sm" 
          onClick={() => onPagamento(cliente.id)}
          className={`${buttonConfig.className} text-white`}
        >
          <IconComponent className="h-4 w-4" />
        </Button>

        {/* Botão Visualizar */}
        <Button size="sm" variant="outline" onClick={() => setIsViewModalOpen(true)}>
          <Eye className="h-4 w-4" />
        </Button>

        {/* Botão Editar */}
        <Button size="sm" variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>

        {/* Botão Mensagens */}
        <Button size="sm" variant="outline" disabled>
          <MessageCircle className="h-4 w-4" />
        </Button>

        {/* Botão Excluir */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Modal de Visualização */}
      <ClienteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        cliente={cliente}
        getPagamentoMesAtual={getPagamentoMesAtual}
      />
    </Card>
  );
};