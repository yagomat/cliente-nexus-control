
import { useState, useMemo } from "react";
import { useClientes } from "@/hooks/useClientes";
import { usePagamentos } from "@/hooks/usePagamentos";
import { calcularDiasParaVencer, calcularStatusCliente } from "@/utils/clienteUtils";
import { ClienteHeader } from "@/components/clientes/ClienteHeader";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteCard } from "@/components/clientes/ClienteCard";
import { ClientePagination } from "@/components/clientes/ClientePagination";
import { ClienteMatrixView } from "@/components/clientes/ClienteMatrixView";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

const Clientes = () => {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("cadastro");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState("lista"); // "lista" ou "matriz"
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { clientes, loading, fetchClientes } = useClientes();
  const { pagamentos, getPagamentoMesAtual, getPagamentoDoMes, handlePagamento } = usePagamentos();

  const clientesFiltrados = useMemo(() => {
    return clientes
      .filter(cliente => {
        const clienteAtivo = calcularStatusCliente(cliente, getPagamentoDoMes);
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
  }, [clientes, filtroStatus, ordenacao, busca, getPagamentoDoMes]);

  // Cálculos de paginação
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  // Reset página quando filtros mudarem
  const handleFiltroChange = (novoFiltro: string) => {
    setFiltroStatus(novoFiltro);
    setCurrentPage(1);
  };

  const handleOrdenacaoChange = (novaOrdenacao: string) => {
    setOrdenacao(novaOrdenacao);
    setCurrentPage(1);
  };

  const handleBuscaChange = (novaBusca: string) => {
    setBusca(novaBusca);
    setCurrentPage(1);
  };

  const handleAnoFiltroChange = (novoAno: number) => {
    setAnoFiltro(novoAno);
    setCurrentPage(1);
  };

  const handleViewModeChange = (novoMode: string) => {
    setViewMode(novoMode);
    if (novoMode === "lista") {
      // Ao sair do modo matriz, volta para o ano vigente
      setAnoFiltro(new Date().getFullYear());
    }
    setCurrentPage(1);
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setFiltroStatus("todos");
    setOrdenacao("cadastro");
    setAnoFiltro(new Date().getFullYear()); // Volta para o ano vigente
    setCurrentPage(1);
  };

  return (
    <div>
        <ClienteHeader />

        <div className="mt-6 w-full">
          <div className="mb-4">
            <ClienteFilters
              busca={busca}
              setBusca={handleBuscaChange}
              filtroStatus={filtroStatus}
              setFiltroStatus={handleFiltroChange}
              ordenacao={ordenacao}
              setOrdenacao={handleOrdenacaoChange}
              clientesFiltrados={clientesFiltrados}
              totalClientes={clientes.length}
              anoFiltro={anoFiltro}
              setAnoFiltro={handleAnoFiltroChange}
              showAnoFilter={viewMode === "matriz"}
              onLimparFiltros={handleLimparFiltros}
            />
          </div>

          {/* Linha com contagem e botões de visualização */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              {clientesFiltrados.length} de {clientes.length} clientes
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === "lista" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("lista")}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Clientes
              </Button>
              <Button
                variant={viewMode === "matriz" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("matriz")}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Pagamentos
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <div className="w-full">
              {viewMode === "lista" ? (
                <div className="space-y-4">
                  {clientesPaginados.map((cliente) => (
                    <ClienteCard
                      key={cliente.id}
                      cliente={cliente}
                      getPagamentoMesAtual={getPagamentoMesAtual}
                      getPagamentoDoMes={getPagamentoDoMes}
                      onPagamento={handlePagamento}
                      onClienteDeleted={fetchClientes}
                    />
                  ))}
                </div>
              ) : (
                <ClienteMatrixView 
                  clientes={clientes}
                  clientesFiltrados={clientesFiltrados}
                  anoFiltro={anoFiltro}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}

          {viewMode === "lista" && (
            <ClientePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={clientesFiltrados.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
    </div>
  );
};

export default Clientes;
