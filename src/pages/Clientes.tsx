import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, Plus, Filter, Download, Upload, Eye, Edit, MessageCircle, Trash2, DollarSign, Check, X, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Clientes = () => {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("cadastro");
  
  const clientes = [
    {
      id: 1,
      nome: "Adriano gomes",
      telefone: "-",
      status: "ativo",
      servidor: "Uniplay",
      diaVencimento: 17,
      diasParaVencer: 35,
      pagamentoPendente: false
    },
    {
      id: 2,
      nome: "Hugo",
      telefone: "(21) 96655-879",
      status: "inativo",
      servidor: "Fire TV",
      diaVencimento: 1,
      diasParaVencer: -5,
      pagamentoPendente: true
    },
    {
      id: 3,
      nome: "Luiza",
      telefone: "-",
      status: "ativo",
      servidor: "Fire TV",
      diaVencimento: 15,
      diasParaVencer: 2,
      pagamentoPendente: false
    },
    {
      id: 4,
      nome: "Ana",
      telefone: "(11) 98765-4321",
      status: "ativo",
      servidor: "Uniplay",
      diaVencimento: 25,
      diasParaVencer: 12,
      pagamentoPendente: false
    }
  ];

  const clientesFiltrados = clientes.filter(cliente => {
    if (filtroStatus === "todos") return true;
    return cliente.status === filtroStatus;
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
      <div className="space-y-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{cliente.nome}</h3>
              <Badge className={getStatusColor(cliente.status)}>
                {cliente.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">📞</span>
                <span>{cliente.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Dia {cliente.diaVencimento}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">💻</span>
                <span>{cliente.servidor}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={getVencimentoColor(cliente.diasParaVencer)}>
                  {getVencimentoTexto(cliente.diasParaVencer)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Botão de Pagamento */}
              <Button 
                size="sm" 
                variant={cliente.pagamentoPendente ? "destructive" : "default"}
                className="flex-1"
              >
                {cliente.pagamentoPendente ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                  </>
                )}
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
        ))}
      </div>

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