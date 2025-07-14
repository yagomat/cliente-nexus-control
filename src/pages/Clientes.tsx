import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { calcularDiasParaVencer, calcularStatusCliente } from "@/utils/clienteUtils";
import { ClienteHeader } from "@/components/clientes/ClienteHeader";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteCard } from "@/components/clientes/ClienteCard";
import { ClientePagination } from "@/components/clientes/ClientePagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PagamentosView from "@/components/clientes/PagamentosView";

const Clientes = () => {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("cadastro");
  const [busca, setBusca] = useState("");
  const [activeTab, setActiveTab] = useState("clientes");
  
  const { clientes, loading, fetchClientes } = useClientes();
  const { getPagamentoMesAtual, handlePagamento } = usePagamentos();

  const clientesFiltrados = clientes
    .filter(cliente => {
      const clienteAtivo = calcularStatusCliente(cliente, getPagamentoMesAtual);
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ClienteHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-6">
          <ClienteFilters
            busca={busca}
            setBusca={setBusca}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            ordenacao={ordenacao}
            setOrdenacao={setOrdenacao}
            clientesFiltrados={clientesFiltrados}
            totalClientes={clientes.length}
          />

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
              {clientesFiltrados.map((cliente) => (
                <ClienteCard
                  key={cliente.id}
                  cliente={cliente}
                  getPagamentoMesAtual={getPagamentoMesAtual}
                  onPagamento={handlePagamento}
                  onClienteDeleted={fetchClientes}
                />
              ))}
            </div>
          )}

          <ClientePagination />
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-6">
          <PagamentosView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Clientes;