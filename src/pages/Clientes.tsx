import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Plus, Filter, Download, Upload, Eye, Edit, MessageCircle, Trash2, DollarSign, Check, X, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Clientes = () => {
  const { user } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("cadastro");
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchClientes();
      fetchPagamentos();
    }
  }, [user]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPagamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPagamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    }
  };

  const getPagamentoMesAtual = (clienteId: string) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    return pagamentos.find(p => 
      p.cliente_id === clienteId && 
      p.mes === mesAtual && 
      p.ano === anoAtual
    );
  };

  const calcularStatusCliente = (cliente: any) => {
    const hoje = new Date();
    const diasParaVencer = calcularDiasParaVencer(cliente.dia_vencimento);
    const pagamentoMesAtual = getPagamentoMesAtual(cliente.id);
    
    // Cliente está ativo se:
    // - Pagou este mês (status 'pago' ou 'promocao') E ainda não venceu
    // - Ou se pagou e ainda não passou do dia de vencimento
    if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
      return diasParaVencer >= 0;
    }
    
    return false;
  };

  const handlePagamento = async (clienteId: string) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    const pagamentoExistente = getPagamentoMesAtual(clienteId);
    
    try {
      if (!pagamentoExistente) {
        // Primeiro clique: registrar pagamento (verde)
        const { error } = await supabase
          .from('pagamentos')
          .insert({
            cliente_id: clienteId,
            user_id: user?.id,
            mes: mesAtual,
            ano: anoAtual,
            status: 'pago'
          });
        
        if (error) throw error;
      } else {
        // Ciclar entre os status
        let novoStatus;
        switch (pagamentoExistente.status) {
          case 'pago':
            novoStatus = 'promocao'; // verde -> azul
            break;
          case 'promocao':
            novoStatus = 'removido'; // azul -> vermelho
            break;
          case 'removido':
            novoStatus = 'pago'; // vermelho -> verde
            break;
          default:
            novoStatus = 'pago';
        }
        
        const { error } = await supabase
          .from('pagamentos')
          .update({ status: novoStatus })
          .eq('id', pagamentoExistente.id);
        
        if (error) throw error;
      }
      
      // Atualizar os dados
      await fetchPagamentos();
      
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getButtonVariantAndColor = (clienteId: string) => {
    const pagamento = getPagamentoMesAtual(clienteId);
    
    if (!pagamento || pagamento.status === 'removido') {
      return { variant: "destructive" as const, className: "bg-red-500 hover:bg-red-600", icon: X };
    }
    
    if (pagamento.status === 'pago') {
      return { variant: "default" as const, className: "bg-green-500 hover:bg-green-600", icon: Check };
    }
    
    if (pagamento.status === 'promocao') {
      return { variant: "default" as const, className: "bg-blue-500 hover:bg-blue-600", icon: Check };
    }
    
    return { variant: "destructive" as const, className: "bg-red-500 hover:bg-red-600", icon: X };
  };

  const calcularDiasParaVencer = (diaVencimento: number) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const diaAtual = hoje.getDate();
    
    let proximoVencimento = new Date(anoAtual, mesAtual, diaVencimento);
    
    if (proximoVencimento < hoje) {
      proximoVencimento = new Date(anoAtual, mesAtual + 1, diaVencimento);
    }
    
    const diffTime = proximoVencimento.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const clientesFiltrados = clientes
    .filter(cliente => {
      const clienteAtivo = calcularStatusCliente(cliente);
      const matchStatus = filtroStatus === "todos" || 
        (filtroStatus === "ativo" && clienteAtivo) || 
        (filtroStatus === "inativo" && !clienteAtivo);
      
      const matchBusca = busca === "" || 
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.telefone.includes(busca);
      
      return matchStatus && matchBusca;
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case "nome-az":
          return a.nome.localeCompare(b.nome);
        case "nome-za":
          return b.nome.localeCompare(a.nome);
        case "vencimento":
          return calcularDiasParaVencer(a.dia_vencimento) - calcularDiasParaVencer(b.dia_vencimento);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    return status === "ativo" 
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  const getVencimentoColor = (dias: number) => {
    if (dias < 0) return "text-red-600 font-medium";
    if (dias <= 5) return "text-yellow-600 font-medium";
    return "text-foreground";
  };

  const getVencimentoTexto = (dias: number) => {
    if (dias < 0) return `Venceu há ${Math.abs(dias)} dias`;
    if (dias === 0) return "Vence hoje";
    return `Vence em ${dias} dias`;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>
        
        {/* Botões de Export/Import */}
        <div className="flex gap-3 mb-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Informações sobre exportação / Importação
        </p>

        {/* Botão Novo Cliente */}
        <Link to="/clientes/novo">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-6">
            <Users className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>

        {/* Campo de busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar clientes..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ordenacao} onValueChange={setOrdenacao}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cadastro">Cadastro</SelectItem>
              <SelectItem value="vencimento">Vencimento</SelectItem>
              <SelectItem value="nome-az">Nome A-Z</SelectItem>
              <SelectItem value="nome-za">Nome Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            1 até {clientesFiltrados.length} de {clientes.length}
          </span>
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </Button>
        </div>
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="text-center py-8">
          <p>Carregando clientes...</p>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clientesFiltrados.map((cliente) => {
            const diasParaVencer = calcularDiasParaVencer(cliente.dia_vencimento);
            const clienteAtivo = calcularStatusCliente(cliente);
            const buttonConfig = getButtonVariantAndColor(cliente.id);
            const IconComponent = buttonConfig.icon;
            
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
                    onClick={() => handlePagamento(cliente.id)}
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
          })}
        </div>
      )}

      {/* Paginação */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select defaultValue="10">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center items-center gap-2 mt-4">
        <Button variant="outline" size="sm">Previous</Button>
        <Button variant="default" size="sm">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
};

export default Clientes;