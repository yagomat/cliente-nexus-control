
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const ClientePagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: ClientePaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <>
      {/* Controle de itens por página */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <span className="text-sm text-muted-foreground">Itens por página:</span>
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
        >
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

      {/* Informação dos itens exibidos */}
      <div className="flex justify-center items-center mt-2 text-sm text-muted-foreground">
        Exibindo {startItem} até {endItem} de {totalItems} resultados
      </div>

      {/* Controles de paginação - só mostra se houver mais de uma página */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        
        {getVisiblePages().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
        </div>
      )}
    </>
  );
};
