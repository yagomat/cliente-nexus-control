
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Server, MapPin, User, DollarSign, Monitor, Smartphone, Key } from "lucide-react";
import { calcularDiasParaVencer, calcularStatusCliente, getVencimentoColor, getVencimentoTexto } from "@/utils/clienteUtils";

interface ClienteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: any | null;
  getPagamentoMesAtual: (clienteId: string) => any;
}

export const ClienteViewModal = ({ isOpen, onClose, cliente, getPagamentoMesAtual }: ClienteViewModalProps) => {
  if (!cliente) return null;

  const diasParaVencer = calcularDiasParaVencer(cliente.dia_vencimento);
  const clienteAtivo = calcularStatusCliente(cliente, getPagamentoMesAtual);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Cadastrado em: {new Date(cliente.created_at).toLocaleDateString('pt-BR')}</span>
            <Badge className={clienteAtivo ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
              {clienteAtivo ? "Ativo" : "Inativo"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Dados Pessoais</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nome:</span>
                  <span className="text-sm font-medium">{cliente.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Telefone:</span>
                  <span className="text-sm font-medium">{cliente.telefone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">UF:</span>
                  <span className="text-sm font-medium">{cliente.uf || "-"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Informações de Pagamento</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Dia do Vencimento:</span>
                  <span className="text-sm font-medium">Dia {cliente.dia_vencimento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Valor do Plano:</span>
                  <span className="text-sm font-medium">
                    {cliente.valor_plano ? `R$ ${cliente.valor_plano.toFixed(2)}` : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Status do Vencimento:</span>
                  <span className={`text-sm font-medium ${getVencimentoColor(diasParaVencer)}`}>
                    {getVencimentoTexto(diasParaVencer)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Aplicativo Principal */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Aplicativo Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Servidor:</span>
                  <span className="text-sm font-medium">{cliente.servidor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Aplicativo:</span>
                  <span className="text-sm font-medium">{cliente.aplicativo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Usuário:</span>
                  <span className="text-sm font-medium">{cliente.usuario_aplicativo || "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Senha:</span>
                  <span className="text-sm font-medium">{cliente.senha_aplicativo || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data da Licença:</span>
                  <span className="text-sm font-medium">
                    {cliente.data_licenca_aplicativo ? new Date(cliente.data_licenca_aplicativo).toLocaleDateString('pt-BR') : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Dispositivo Smart:</span>
                  <span className="text-sm font-medium">{cliente.dispositivo_smart || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aplicativo Secundário */}
          {cliente.aplicativo_2 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Aplicativo Secundário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Aplicativo:</span>
                    <span className="text-sm font-medium">{cliente.aplicativo_2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Usuário:</span>
                    <span className="text-sm font-medium">{cliente.usuario_aplicativo_2 || "-"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Senha:</span>
                    <span className="text-sm font-medium">{cliente.senha_aplicativo_2 || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Data da Licença:</span>
                    <span className="text-sm font-medium">
                      {cliente.data_licenca_aplicativo_2 ? new Date(cliente.data_licenca_aplicativo_2).toLocaleDateString('pt-BR') : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Dispositivo Smart:</span>
                    <span className="text-sm font-medium">{cliente.dispositivo_smart_2 || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tela Adicional:</span>
                <Badge variant={cliente.tela_adicional ? "default" : "secondary"}>
                  {cliente.tela_adicional ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Observações */}
          {cliente.observacoes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Observações</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{cliente.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
