import { useState, useEffect } from "react";
import { useClientesCalculos } from "@/hooks/useClientesCalculos";
import { usePagamentos, addPagamentoUpdateListener } from "@/hooks/usePagamentos";
import { ClienteHeader } from "@/components/clientes/ClienteHeader";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteCard } from "@/components/clientes/ClienteCard";
import { ClientePagination } from "@/components/clientes/ClientePagination";
import { ClienteMatrixView } from "@/components/clientes/ClienteMatrixView";
import { Button } from "@/components/ui/button";
import { Grid, List, Check, Gift, X } from "lucide-react";

const Clientes = () => {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("cadastro");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState("lista"); // "lista" ou "matriz"
  const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { clientes, loading, pagination, fetchClientes, refreshClientes } = useClientesCalculos();
  const { getPagamentoMesAtual, handlePagamento } = usePagamentos();

  // Função para converter ordenação para formato da API
  const getOrdenacaoForAPI = (ordenacao: string) => {
    if (ordenacao === 'cadastro') return `${ordenacao}_desc`;
    if (ordenacao === 'nome-za') return `${ordenacao}_desc`;
    return `${ordenacao}_asc`;
  };

  // Atualizar dados quando filtros mudarem
  useEffect(() => {
    fetchClientes({
      search: busca,
      status: filtroStatus,
      ordenacao: getOrdenacaoForAPI(ordenacao),
      page: currentPage,
      itemsPerPage,
      ano: anoFiltro
    });
  }, [fetchClientes, busca, filtroStatus, ordenacao, currentPage, itemsPerPage, anoFiltro]);


  // Usar dados de paginação do backend
  const totalPages = pagination?.totalPages || 0;
  const totalItems = pagination?.total || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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
      setAnoFiltro(new Date().getFullYear());
    }
    setCurrentPage(1);
  };

  const handleLimparFiltros = () => {
    setBusca("");
    setFiltroStatus("todos");
    setOrdenacao("cadastro");
    setAnoFiltro(new Date().getFullYear());
    setCurrentPage(1);
  };

  const refetchData = () => {
    fetchClientes({
      search: busca,
      status: filtroStatus,
      ordenacao: getOrdenacaoForAPI(ordenacao),
      page: currentPage,
      itemsPerPage,
      ano: anoFiltro
    });
  };

  return (
    <div>
      <ClienteHeader 
        clientes={clientes} 
        onImportComplete={refetchData}
      />

      <div className="mt-6 w-full">
        <div className="mb-4">
          <ClienteFilters
            busca={busca}
            setBusca={handleBuscaChange}
            filtroStatus={filtroStatus}
            setFiltroStatus={handleFiltroChange}
            ordenacao={ordenacao}
            setOrdenacao={handleOrdenacaoChange}
            clientesFiltrados={clientes}
            totalClientes={totalItems}
            anoFiltro={anoFiltro}
            setAnoFiltro={handleAnoFiltroChange}
            showAnoFilter={viewMode === "matriz"}
            onLimparFiltros={handleLimparFiltros}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {totalItems} clientes encontrados
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
        ) : clientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="w-full">
            {viewMode === "lista" ? (
              <div className="space-y-4">
                {clientes.map((cliente) => (
                  <ClienteCard
                    key={cliente.id}
                    cliente={cliente}
                    statusAtivo={cliente.status_ativo}
                    vencimentoInfo={cliente.vencimento_dias !== null ? {
                      dias: cliente.vencimento_dias,
                      texto: cliente.vencimento_texto || '',
                      vencido: cliente.vencimento_vencido
                    } : null}
                    getPagamentoMesAtual={getPagamentoMesAtual}
                    onPagamento={handlePagamento}
                    onClienteDeleted={refetchData}
                  />
                ))}
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      <span>Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                        <Gift className="h-2 w-2 text-white" />
                      </div>
                      <span>Promoção</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-red-200 rounded flex items-center justify-center">
                        <X className="h-2 w-2 text-red-500" />
                      </div>
                      <span>Não pago</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ClienteMatrixView
                anoFiltro={anoFiltro}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                searchTerm={busca}
                filtroStatus={filtroStatus}
                ordenacao={getOrdenacaoForAPI(ordenacao)}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        )}

        {!loading && clientes.length > 0 && viewMode === "lista" && (
          <ClientePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Clientes;