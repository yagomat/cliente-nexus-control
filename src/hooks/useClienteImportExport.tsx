import { useState } from "react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ImportError {
  linha: number;
  campo: string;
  valor: string;
  erro: string;
}

interface ImportResult {
  success: boolean;
  clientesImportados: number;
  clientesRejeitados: number;
  erros: ImportError[];
  message?: string;
}

export const useClienteImportExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Estados válidos do Brasil
  const ESTADOS_VALIDOS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

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

  // Função para validar nome
  const validarNome = (nome: string, linha: number, erros: ImportError[]) => {
    if (!nome || nome.trim() === '') {
      erros.push({ linha, campo: 'Nome', valor: nome, erro: 'Nome é obrigatório' });
      return false;
    }
    if (nome.length > 40) {
      erros.push({ linha, campo: 'Nome', valor: nome, erro: 'Nome deve ter no máximo 40 caracteres' });
      return false;
    }
    return true;
  };

  // Função para validar UF
  const validarUF = (uf: string, linha: number, erros: ImportError[]) => {
    if (!uf || uf.trim() === '') {
      return true; // UF é opcional
    }
    
    const ufUpper = uf.toUpperCase();
    if (ufUpper.length !== 2) {
      erros.push({ linha, campo: 'UF', valor: uf, erro: 'UF deve ter exatamente 2 caracteres' });
      return false;
    }
    
    if (!/^[A-Z]{2}$/.test(ufUpper)) {
      erros.push({ linha, campo: 'UF', valor: uf, erro: 'UF deve conter apenas letras' });
      return false;
    }
    
    if (!ESTADOS_VALIDOS.includes(ufUpper)) {
      erros.push({ linha, campo: 'UF', valor: uf, erro: 'UF deve ser um estado válido do Brasil' });
      return false;
    }
    
    return true;
  };

  // Função para validar telefone (agora opcional)
  const validarTelefone = (telefone: string, linha: number, erros: ImportError[]) => {
    if (!telefone || telefone.trim() === '') {
      return true; // Telefone agora é opcional
    }
    
    // Remove caracteres não numéricos
    const telefoneNumerico = telefone.replace(/\D/g, '');
    
    if (telefoneNumerico.length > 11) {
      erros.push({ linha, campo: 'Telefone', valor: telefone, erro: 'Telefone deve ter no máximo 11 dígitos' });
      return false;
    }
    
    if (telefoneNumerico.length < 10) {
      erros.push({ linha, campo: 'Telefone', valor: telefone, erro: 'Telefone deve ter pelo menos 10 dígitos' });
      return false;
    }
    
    return true;
  };

  // Função para validar servidor
  const validarServidor = (servidor: string, linha: number, erros: ImportError[]) => {
    if (!servidor || servidor.trim() === '') {
      erros.push({ linha, campo: 'Servidor', valor: servidor, erro: 'Servidor é obrigatório' });
      return false;
    }
    if (servidor.length > 50) {
      erros.push({ linha, campo: 'Servidor', valor: servidor, erro: 'Servidor deve ter no máximo 50 caracteres' });
      return false;
    }
    return true;
  };

  // Função para validar dia de vencimento
  const validarDiaVencimento = (dia: string, linha: number, erros: ImportError[]) => {
    if (!dia || dia.toString().trim() === '') {
      erros.push({ linha, campo: 'Dia de vencimento', valor: dia, erro: 'Dia de vencimento é obrigatório' });
      return false;
    }
    
    const diaNumerico = parseInt(dia.toString());
    if (isNaN(diaNumerico) || diaNumerico < 1 || diaNumerico > 31) {
      erros.push({ linha, campo: 'Dia de vencimento', valor: dia, erro: 'Dia de vencimento deve ser um número entre 1 e 31' });
      return false;
    }
    
    return true;
  };

  // Função para validar valor do plano
  const validarValorPlano = (valor: string, linha: number, erros: ImportError[]) => {
    if (!valor || valor.toString().trim() === '') {
      return true; // Valor é opcional
    }
    
    const valorNumerico = parseFloat(valor.toString());
    if (isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 1000) {
      erros.push({ linha, campo: 'Valor do Plano', valor: valor, erro: 'Valor do plano deve ser um número entre 1 e 1000' });
      return false;
    }
    
    return true;
  };

  // Função para validar aplicativo
  const validarAplicativo = (aplicativo: string, linha: number, erros: ImportError[]) => {
    if (!aplicativo || aplicativo.trim() === '') {
      erros.push({ linha, campo: 'Aplicativo', valor: aplicativo, erro: 'Aplicativo é obrigatório' });
      return false;
    }
    if (aplicativo.length > 50) {
      erros.push({ linha, campo: 'Aplicativo', valor: aplicativo, erro: 'Aplicativo deve ter no máximo 50 caracteres' });
      return false;
    }
    return true;
  };

  // Função para validar usuário do aplicativo
  const validarUsuarioAplicativo = (usuario: string, campo: string, linha: number, erros: ImportError[]) => {
    if (!usuario || usuario.trim() === '') {
      return true; // Usuário é opcional
    }
    if (usuario.length > 25) {
      erros.push({ linha, campo, valor: usuario, erro: 'Usuário do aplicativo deve ter no máximo 25 caracteres' });
      return false;
    }
    return true;
  };

  // Função para validar senha do aplicativo
  const validarSenhaAplicativo = (senha: string, campo: string, linha: number, erros: ImportError[]) => {
    if (!senha || senha.trim() === '') {
      return true; // Senha é opcional
    }
    if (senha.length > 25) {
      erros.push({ linha, campo, valor: senha, erro: 'Senha do aplicativo deve ter no máximo 25 caracteres' });
      return false;
    }
    return true;
  };

  // Função para validar observações
  const validarObservacoes = (observacoes: string, linha: number, erros: ImportError[]) => {
    if (!observacoes || observacoes.trim() === '') {
      return true; // Observações são opcionais
    }
    if (observacoes.length > 150) {
      erros.push({ linha, campo: 'Observações', valor: observacoes, erro: 'Observações devem ter no máximo 150 caracteres' });
      return false;
    }
    return true;
  };

  const importarClientes = async (file: File): Promise<ImportResult> => {
    if (!user) return { success: false, clientesImportados: 0, clientesRejeitados: 0, erros: [], message: "Usuário não autenticado" };

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
      const erros: ImportError[] = [];
      let clientesRejeitados = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const numeroLinha = i + 2; // +2 porque pulamos cabeçalho e arrays começam em 0
        const errosLinha: ImportError[] = [];
        
        // Verificar se a linha tem dados suficientes (pelo menos nome)
        if (!row[1] || row[1].toString().trim() === '') {
          continue; // Pular linhas vazias
        }

        // Validar cada campo
        const nome = row[1]?.toString().trim();
        const uf = row[2]?.toString().trim() || null;
        const telefone = row[3]?.toString().trim() || null; // Agora pode ser null
        const servidor = row[4]?.toString().trim();
        const diaVencimento = row[5]?.toString().trim();
        const valorPlano = row[6]?.toString().trim();
        const dispositivoSmart = row[7]?.toString().trim() || null;
        const aplicativo = row[8]?.toString().trim();
        const usuarioAplicativo = row[9]?.toString().trim() || null;
        const senhaAplicativo = row[10]?.toString().trim() || null;
        const dataLicencaAplicativo = row[11]?.toString().trim();
        const dispositivoSmart2 = row[12]?.toString().trim() || null;
        const aplicativo2 = row[13]?.toString().trim() || null;
        const usuarioAplicativo2 = row[14]?.toString().trim() || null;
        const senhaAplicativo2 = row[15]?.toString().trim() || null;
        const dataLicencaAplicativo2 = row[16]?.toString().trim();
        const observacoes = row[17]?.toString().trim() || null;

        // Executar todas as validações
        validarNome(nome, numeroLinha, errosLinha);
        validarUF(uf || '', numeroLinha, errosLinha);
        validarTelefone(telefone || '', numeroLinha, errosLinha); // Agora opcional
        validarServidor(servidor, numeroLinha, errosLinha);
        validarDiaVencimento(diaVencimento, numeroLinha, errosLinha);
        validarValorPlano(valorPlano, numeroLinha, errosLinha);
        validarAplicativo(aplicativo, numeroLinha, errosLinha);
        validarUsuarioAplicativo(usuarioAplicativo || '', 'Usuário do aplicativo 1', numeroLinha, errosLinha);
        validarSenhaAplicativo(senhaAplicativo || '', 'Senha do aplicativo 1', numeroLinha, errosLinha);
        validarUsuarioAplicativo(usuarioAplicativo2 || '', 'Usuário do aplicativo 2', numeroLinha, errosLinha);
        validarSenhaAplicativo(senhaAplicativo2 || '', 'Senha do aplicativo 2', numeroLinha, errosLinha);
        validarObservacoes(observacoes || '', numeroLinha, errosLinha);

        // Se há erros nesta linha, adicionar aos erros gerais e pular
        if (errosLinha.length > 0) {
          erros.push(...errosLinha);
          clientesRejeitados++;
          continue;
        }

        // Montar cliente válido
        const cliente = {
          nome,
          uf: uf ? uf.toUpperCase() : null,
          telefone: telefone ? telefone.replace(/\D/g, '') : null, // Pode ser null agora
          servidor,
          dia_vencimento: parseInt(diaVencimento),
          valor_plano: valorPlano ? parseFloat(valorPlano) : null,
          dispositivo_smart: dispositivoSmart,
          aplicativo,
          usuario_aplicativo: usuarioAplicativo,
          senha_aplicativo: senhaAplicativo,
          data_licenca_aplicativo: dataLicencaAplicativo ? parseDateFromString(dataLicencaAplicativo) : null,
          dispositivo_smart_2: dispositivoSmart2,
          aplicativo_2: aplicativo2,
          usuario_aplicativo_2: usuarioAplicativo2,
          senha_aplicativo_2: senhaAplicativo2,
          data_licenca_aplicativo_2: dataLicencaAplicativo2 ? parseDateFromString(dataLicencaAplicativo2) : null,
          observacoes,
          user_id: user.id,
          tela_adicional: !!(dispositivoSmart2 || aplicativo2)
        };

        clientesParaImportar.push(cliente);
      }

      // Inserir clientes válidos no banco
      let clientesImportados = 0;
      if (clientesParaImportar.length > 0) {
        const { error } = await supabase
          .from('clientes')
          .insert(clientesParaImportar);

        if (error) throw error;
        clientesImportados = clientesParaImportar.length;
      }

      // Salvar erros para exibir no diálogo
      if (erros.length > 0) {
        setImportErrors(erros);
        setShowErrorDialog(true);
      }

      // Mostrar resultado
      const mensagemSucesso = clientesImportados > 0 ? 
        `${clientesImportados} cliente(s) importado(s) com sucesso.` : '';
      
      const mensagemErros = clientesRejeitados > 0 ? 
        `${clientesRejeitados} cliente(s) rejeitado(s).` : '';

      const mensagemCompleta = [mensagemSucesso, mensagemErros].filter(Boolean).join(' ');

      toast({
        title: "Importação concluída",
        description: mensagemCompleta,
        variant: clientesImportados > 0 ? "default" : "destructive",
      });

      return { 
        success: true, 
        clientesImportados, 
        clientesRejeitados, 
        erros 
      };
    } catch (error) {
      console.error('Erro ao importar clientes:', error);
      const message = error instanceof Error ? error.message : "Erro desconhecido na importação";
      toast({
        title: "Erro na importação",
        description: message,
        variant: "destructive",
      });
      return { 
        success: false, 
        clientesImportados: 0, 
        clientesRejeitados: 0, 
        erros: [], 
        message 
      };
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
    isImporting,
    importErrors,
    showErrorDialog,
    setShowErrorDialog
  };
};
