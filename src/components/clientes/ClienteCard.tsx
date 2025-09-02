import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Eye, Edit, MessageCircle, Trash2, Calendar, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useClienteActions } from "@/hooks/useClienteActions";
import { getButtonVariantAndColor } from "@/utils/clienteUtils";
import { ClienteViewModal } from "./ClienteViewModal";
import { TemplateModal } from "@/components/templates/TemplateModal";
import { addPagamentoUpdateListener } from "@/hooks/usePagamentos";

interface VencimentoInfo {
  dias: number;
  texto: string;
  vencido: boolean;
}

interface ClienteCardProps {
  cliente: any;
  statusAtivo: boolean;
  vencimentoInfo: VencimentoInfo | null;
  getPagamentoMesAtual: (clienteId: string) => any;
  onPagamento: (clienteId: string) => void;
  onClienteDeleted: () => void;
}

export const ClienteCard = ({ 
  cliente, 
  statusAtivo, 
  vencimentoInfo, 
  getPagamentoMesAtual, 
  onPagamento, 
  onClienteDeleted 
}: ClienteCardProps) => {
  const navigate = useNavigate();
  const { softDeleteCliente } = useClienteActions();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Estado local para o pagamento atual (para atualização imediata)
  const [localPagamento, setLocalPagamento] = useState(() => getPagamentoMesAtual(cliente.id));
  
  // Escutar atualizações de pagamento específicas para este cliente
  useEffect(() => {
    const removeListener = addPagamentoUpdateListener(() => {
      const novoPagamento = getPagamentoMesAtual(cliente.id);
      setLocalPagamento(novoPagamento);
    });

    return removeListener;
  }, [cliente.id, getPagamentoMesAtual]);
  
  // Usar pagamento local para calcular config do botão
  const getLocalPagamentoMesAtual = (clienteId: string) => {
    return clienteId === cliente.id ? localPagamento : getPagamentoMesAtual(clienteId);
  };
  
  const buttonConfig = getButtonVariantAndColor(cliente.id, getLocalPagamentoMesAtual);
  
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

  const pagamento = localPagamento;
  const isPromocao = pagamento && pagamento.status === 'promocao';

  const getVencimentoColor = (dias: number | null) => {
    if (dias === null) return "text-muted-foreground";
    if (dias < 0) return "text-destructive font-medium";
    if (dias <= 5) return "text-yellow-600 font-medium";
    return "text-foreground";
  };

  const handleEdit = () => {
    navigate(`/clientes/editar/${cliente.id}`);
  };

  const handleDelete = async () => {
    const success = await softDeleteCliente(cliente.id);
    if (success) {
      onClienteDeleted();
    }
  };
  
  return (
    <Card key={cliente.id} className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{cliente.nome}</h3>
        <Badge className={statusAtivo ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
          {statusAtivo ? "Ativo" : "Inativo"}
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

      <div className="flex justify-between items-center">
        <Button 
          size="sm" 
          onClick={() => onPagamento(cliente.id)}
          className={`${buttonConfig.className} text-white`}
        >
          {isPromocao ? <Gift className="h-4 w-4" /> : <IconComponent className="h-4 w-4" />}
        </Button>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsViewModalOpen(true)}>
            <Eye className="h-4 w-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>

          <Button size="sm" variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
            <MessageCircle className="h-4 w-4" />
          </Button>

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
                  Tem certeza que deseja remover o cliente <strong>{cliente.nome}</strong>? 
                  O cliente será arquivado mas seus dados e histórico de pagamentos serão preservados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <ClienteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        cliente={cliente}
        getPagamentoMesAtual={getLocalPagamentoMesAtual}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templateData={{ cliente, vencimentoInfo }}
      />
    </Card>
  );
};