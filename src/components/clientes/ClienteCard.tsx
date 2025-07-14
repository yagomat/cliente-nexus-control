import { Check, X, Eye, Edit, MessageCircle, Trash2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calcularDiasParaVencer, calcularStatusCliente, getButtonVariantAndColor, getVencimentoColor, getVencimentoTexto } from "@/utils/clienteUtils";

interface ClienteCardProps {
  cliente: any;
  getPagamentoMesAtual: (clienteId: string) => any;
  onPagamento: (clienteId: string) => void;
}

export const ClienteCard = ({ cliente, getPagamentoMesAtual, onPagamento }: ClienteCardProps) => {
  const diasParaVencer = calcularDiasParaVencer(cliente.dia_vencimento);
  const clienteAtivo = calcularStatusCliente(cliente, getPagamentoMesAtual);
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
          <span className={getVencimentoColor(diasParaVencer)}>
            {getVencimentoTexto(diasParaVencer)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Botão de Pagamento */}
        <Button 
          size="sm" 
          onClick={() => onPagamento(cliente.id)}
          className={`flex-1 ${buttonConfig.className} text-white`}
        >
          <IconComponent className="h-4 w-4 mr-1" />
        </Button>

        {/* Botão Visualizar */}
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>

        {/* Botão Editar */}
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>

        {/* Botão Mensagens */}
        <Button size="sm" variant="outline">
          <MessageCircle className="h-4 w-4" />
        </Button>

        {/* Botão Excluir */}
        <Button size="sm" variant="outline">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};