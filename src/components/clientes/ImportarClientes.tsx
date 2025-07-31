
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { useClienteImportExport } from "@/hooks/useClienteImportExport";
import { ImportErrorDialog } from "./ImportErrorDialog";
import { ImportApprovalModal } from "./ImportApprovalModal";
import { ImportResultModal } from "./ImportResultModal";

interface ImportarClientesProps {
  onImportComplete: () => void;
}

export const ImportarClientes = ({ onImportComplete }: ImportarClientesProps) => {
  const { 
    importarClientes, 
    isImporting, 
    importErrors, 
    showErrorDialog, 
    setShowErrorDialog,
    missingDataItems,
    showApprovalModal,
    setShowApprovalModal,
    handleApprovalComplete,
    showResultModal,
    setShowResultModal,
    importResult
  } = useClienteImportExport();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Verificar extensão do arquivo
      const allowedExtensions = ['.xlsx', '.xls', '.ods'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Formato de arquivo não suportado. Use Excel (.xlsx, .xls) ou LibreOffice (.ods)');
        return;
      }

      const result = await importarClientes(file);
      
      // Se a importação foi bem-sucedida sem modal de aprovação, completar
      if (result.success && (result.clientesImportados > 0 || result.clientesDuplicados > 0)) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro no processo de importação:', error);
    } finally {
      // Limpar input para permitir reimportação do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApproval = async (approvedItems: any[]) => {
    try {
      const result = await handleApprovalComplete(approvedItems);
      if (result.success && (result.clientesImportados > 0 || result.clientesDuplicados > 0)) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
    }
  };

  const handleApprovalCancel = () => {
    setShowApprovalModal(false);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (importResult.success && (importResult.clientesImportados > 0 || importResult.clientesDuplicados > 0)) {
      onImportComplete();
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

      <ImportApprovalModal
        open={showApprovalModal}
        onOpenChange={setShowApprovalModal}
        missingItems={missingDataItems}
        onApprove={handleApproval}
        onCancel={handleApprovalCancel}
      />

      <ImportResultModal
        open={showResultModal}
        onOpenChange={handleResultModalClose}
        clientesImportados={importResult.clientesImportados}
        clientesRejeitados={importResult.clientesRejeitados}
        erros={importResult.erros}
        duplicados={importResult.clientesDuplicados}
      />
    </>
  );
};
