
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
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
}

export const ClienteFilters = ({
  busca,
  setBusca,
  filtroStatus,
  setFiltroStatus,
  ordenacao,
  setOrdenacao,
  clientesFiltrados,
  totalClientes
}: ClienteFiltersProps) => {
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
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <Select value={ordenacao} onValueChange={setOrdenacao}>
            <SelectTrigger className="flex-1">
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
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {clientesFiltrados.length === totalClientes ? (
          `${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
        ) : (
          `${clientesFiltrados.length} de ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
        )}
      </div>
    </div>
  );
};
