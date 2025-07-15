
import { Search, Filter, Users, ArrowUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ClienteFiltersProps {
  busca: string;
  setBusca: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  ordenacao: string;
  setOrdenacao: (value: string) => void;
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
  const limparFiltros = () => {
    setBusca("");
    setFiltroStatus("todos");
    setOrdenacao("cadastro");
  };

  return (
    <>
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
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cadastro">Cadastro</SelectItem>
            <SelectItem value="vencimento">Vencimento</SelectItem>
            <SelectItem value="nome-az">Nome A-Z</SelectItem>
            <SelectItem value="nome-za">Nome Z-A</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={limparFiltros} className="px-3">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-muted-foreground">
          1 até {clientesFiltrados.length} de {totalClientes}
        </span>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Users className="h-4 w-4 mr-2" />
          Clientes
        </Button>
      </div>
    </>
  );
};
