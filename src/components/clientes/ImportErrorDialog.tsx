
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

interface ImportError {
  linha: number;
  campo: string;
  valor: string;
  erro: string;
}

interface ImportErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: ImportError[];
}

export const ImportErrorDialog = ({ open, onOpenChange, errors }: ImportErrorDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Erros na Importação
          </AlertDialogTitle>
          <AlertDialogDescription>
            {errors.length} erro(s) encontrado(s) durante a importação. Verifique os detalhes abaixo:
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ScrollArea className="max-h-96 w-full">
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div key={index} className="border rounded-lg p-3 bg-red-50">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-red-700">
                    Linha {error.linha}:
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">
                      {error.campo}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {error.erro}
                    </p>
                    {error.valor && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Valor: "{error.valor}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Entendi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
