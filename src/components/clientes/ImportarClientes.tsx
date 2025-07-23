
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useClienteImportExport } from "@/hooks/useClienteImportExport";
import { ImportErrorDialog } from "./ImportErrorDialog";

interface ImportarClientesProps {
  onImportComplete: () => void;
}

export const ImportarClientes = ({ onImportComplete }: ImportarClientesProps) => {
  const { 
    importarClientes, 
    isImporting, 
    importErrors, 
    showErrorDialog, 
    setShowErrorDialog 
  } = useClienteImportExport();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar extensão do arquivo
    const allowedExtensions = ['.xlsx', '.xls', '.ods'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Formato de arquivo não suportado. Use Excel (.xlsx, .xls) ou LibreOffice (.ods)');
      return;
    }

    const result = await importarClientes(file);
    if (result.success) {
      onImportComplete();
    }

    // Limpar input para permitir reimportação do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 flex-1 justify-center"
        onClick={handleImport}
        disabled={isImporting}
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Importando..." : "Importar Excel"}
      </Button>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.ods"
        onChange={handleFileChange}
        className="hidden"
      />

      <ImportErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errors={importErrors}
      />
    </>
  );
};
