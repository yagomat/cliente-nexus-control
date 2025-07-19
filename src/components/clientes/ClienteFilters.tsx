
import { Search, Filter, SortAsc, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClienteFiltersProps {
  busca: string;
  setBusca: (busca: string) => void;
  filtroStatus: string;
  setFiltroStatus: (status: string) => void;
  ordenacao: string;
  setOrdenacao: (ordenacao: string) => void;
  clientesFiltrados: any[];
  totalClientes: number;
  anoFiltro?: number;
  setAnoFiltro?: (ano: number) => void;
  showAnoFilter?: boolean;
  onLimparFiltros?: () => void;
}

export const ClienteFilters = ({
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  ordenacao,
  setOrdenacao,
  clientesFiltrados,
  totalClientes,
  anoFiltro,
  setAnoFiltro,
  showAnoFilter = false,
  onLimparFiltros
}: ClienteFiltersProps) => {
  // Gerar anos disponíveis (4 anos atrás até 4 anos à frente)
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: 9 }, (_, i) => anoAtual - 4 + i);
  return (
    <div className="space-y-4 flex-1">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros e ordenação em linha */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="pl-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
          <Select value={ordenacao} onValueChange={setOrdenacao}>
            <SelectTrigger className="pl-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cadastro">Cadastro</SelectItem>
              <SelectItem value="nome-az">Nome A-Z</SelectItem>
              <SelectItem value="nome-za">Nome Z-A</SelectItem>
              <SelectItem value="vencimento">Vencimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de ano - só aparece no modo matriz */}
        {showAnoFilter && anoFiltro && setAnoFiltro && (
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10 pointer-events-none" />
            <Select value={anoFiltro.toString()} onValueChange={(value) => setAnoFiltro(parseInt(value))}>
              <SelectTrigger className="pl-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anosDisponiveis.map((ano) => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Botão Limpar Filtros */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLimparFiltros || (() => {
            setBusca("");
            setFiltroStatus("todos");
            setOrdenacao("cadastro");
          })}
          className="text-muted-foreground hover:text-foreground"
        >
          Limpar Filtros
        </Button>
      </div>

    </div>
  );
};
