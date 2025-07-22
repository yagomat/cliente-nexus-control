
import { useState } from "react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const useClienteImportExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportarClientes = async (clientes: any[]) => {
    setIsExporting(true);
    try {
      // Preparar dados para exportação na ordem especificada
      const dadosExportacao = clientes.map(cliente => ({
        'Data de cadastro': new Date(cliente.created_at).toLocaleDateString('pt-BR'),
        'Nome': cliente.nome,
        'UF': cliente.uf || '',
        'Telefone': cliente.telefone,
        'Servidor': cliente.servidor,
        'Dia de vencimento': cliente.dia_vencimento,
        'Valor do Plano': cliente.valor_plano || '',
        'Dispositivo Smart 1': cliente.dispositivo_smart || '',
        'Aplicativo 1': cliente.aplicativo,
        'Usuário do aplicativo 1': cliente.usuario_aplicativo || '',
        'Senha do aplicativo 1': cliente.senha_aplicativo || '',
        'Vencimento da licença do app 1': cliente.data_licenca_aplicativo ? new Date(cliente.data_licenca_aplicativo).toLocaleDateString('pt-BR') : '',
        'Dispositivo Smart 2': cliente.dispositivo_smart_2 || '',
        'Aplicativo 2': cliente.aplicativo_2 || '',
        'Usuário do aplicativo 2': cliente.usuario_aplicativo_2 || '',
        'Senha do aplicativo 2': cliente.senha_aplicativo_2 || '',
        'Vencimento da licença do app 2': cliente.data_licenca_aplicativo_2 ? new Date(cliente.data_licenca_aplicativo_2).toLocaleDateString('pt-BR') : '',
        'Observações': cliente.observacoes || ''
      }));

      // Criar workbook e worksheet
      const ws = XLSX.utils.json_to_sheet(dadosExportacao);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");

      // Gerar arquivo e fazer download
      const fileName = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Exportação concluída",
        description: `${clientes.length} clientes exportados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao exportar clientes:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importarClientes = async (file: File) => {
    if (!user) return { success: false, message: "Usuário não autenticado" };

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados");
      }

      // Remover linha de cabeçalho
      const rows = jsonData.slice(1) as any[][];
      const clientesParaImportar = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Verificar se a linha tem dados suficientes (pelo menos nome)
        if (!row[1] || row[1].toString().trim() === '') {
          continue; // Pular linhas vazias
        }

        // Mapear colunas conforme ordem especificada
        const cliente = {
          nome: row[1]?.toString().trim(),
          uf: row[2]?.toString().trim() || null,
          telefone: row[3]?.toString().trim(),
          servidor: row[4]?.toString().trim(),
          dia_vencimento: parseInt(row[5]?.toString()) || 1,
          valor_plano: row[6] ? parseFloat(row[6].toString()) : null,
          dispositivo_smart: row[7]?.toString().trim() || null,
          aplicativo: row[8]?.toString().trim(),
          usuario_aplicativo: row[9]?.toString().trim() || null,
          senha_aplicativo: row[10]?.toString().trim() || null,
          data_licenca_aplicativo: row[11] ? parseDateFromString(row[11].toString()) : null,
          dispositivo_smart_2: row[12]?.toString().trim() || null,
          aplicativo_2: row[13]?.toString().trim() || null,
          usuario_aplicativo_2: row[14]?.toString().trim() || null,
          senha_aplicativo_2: row[15]?.toString().trim() || null,
          data_licenca_aplicativo_2: row[16] ? parseDateFromString(row[16].toString()) : null,
          observacoes: row[17]?.toString().trim() || null,
          user_id: user.id,
          tela_adicional: !!(row[12] || row[13]) // Se tem dispositivo 2 ou app 2, habilita tela adicional
        };

        // Validações básicas
        if (!cliente.nome || !cliente.telefone || !cliente.servidor || !cliente.aplicativo) {
          console.warn(`Linha ${i + 2}: Campos obrigatórios faltando (Nome, Telefone, Servidor, Aplicativo)`);
          continue;
        }

        if (cliente.dia_vencimento < 1 || cliente.dia_vencimento > 31) {
          console.warn(`Linha ${i + 2}: Dia de vencimento inválido`);
          cliente.dia_vencimento = 1;
        }

        clientesParaImportar.push(cliente);
      }

      if (clientesParaImportar.length === 0) {
        throw new Error("Nenhum cliente válido encontrado no arquivo");
      }

      // Inserir clientes no banco
      const { error } = await supabase
        .from('clientes')
        .insert(clientesParaImportar);

      if (error) throw error;

      toast({
        title: "Importação concluída",
        description: `${clientesParaImportar.length} clientes importados com sucesso.`,
      });

      return { success: true, count: clientesParaImportar.length };
    } catch (error) {
      console.error('Erro ao importar clientes:', error);
      const message = error instanceof Error ? error.message : "Erro desconhecido na importação";
      toast({
        title: "Erro na importação",
        description: message,
        variant: "destructive",
      });
      return { success: false, message };
    } finally {
      setIsImporting(false);
    }
  };

  // Função auxiliar para converter string de data para formato ISO
  const parseDateFromString = (dateString: string): string | null => {
    try {
      // Tentar diferentes formatos de data
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          let day, month, year;
          if (format === formats[0]) { // DD/MM/YYYY
            [, day, month, year] = match;
          } else { // YYYY-MM-DD
            [, year, month, day] = match;
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    exportarClientes,
    importarClientes,
    isExporting,
    isImporting
  };
};
