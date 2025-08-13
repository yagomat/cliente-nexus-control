
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useEffect } from "react";
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
  const isMountedRef = useRef(true);

  // Cleanup no desmount do componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Iniciando importação do arquivo:', file.name);
      
      // Verificar extensão do arquivo
      const allowedExtensions = ['.xlsx', '.xls', '.ods'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Formato de arquivo não suportado. Use Excel (.xlsx, .xls) ou LibreOffice (.ods)');
        return;
      }

      console.log('Arquivo válido, chamando importarClientes...');
      const result = await importarClientes(file);
      console.log('Resultado da importação:', result);
      
      // Verificar se o componente ainda está montado antes de atualizar estado
      if (!isMountedRef.current) {
        console.log('Componente foi desmontado, cancelando processamento');
        return;
      }
      
      // Se a importação foi bem-sucedida sem modal de aprovação, completar
      if (result.success && (result.clientesImportados > 0 || result.clientesDuplicados > 0 || result.clientesRestaurados > 0)) {
        console.log('Importação bem-sucedida, chamando onImportComplete');
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro no processo de importação:', error);
      
      // Verificar se o componente ainda está montado antes de mostrar erro
      if (isMountedRef.current) {
        alert(`Erro na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    } finally {
      // Limpar input para permitir reimportação do mesmo arquivo, mas apenas se ainda montado
      if (isMountedRef.current && fileInputRef.current) {
        try {
          fileInputRef.current.value = '';
        } catch (e) {
          console.warn('Erro ao limpar input:', e);
        }
      }
    }
  };

  const handleApproval = async (approvedItems: any[]) => {
    try {
      const result = await handleApprovalComplete(approvedItems);
      if (result.success && (result.clientesImportados > 0 || result.clientesDuplicados > 0 || result.clientesRestaurados > 0)) {
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
    if (importResult.success && (importResult.clientesImportados > 0 || importResult.clientesDuplicados > 0 || importResult.clientesRestaurados > 0)) {
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
        restaurados={importResult.clientesRestaurados}
      />
    </>
  );
};
