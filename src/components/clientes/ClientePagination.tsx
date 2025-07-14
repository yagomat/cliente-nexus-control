import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ClientePagination = () => {
  return (
    <>
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
    </>
  );
};