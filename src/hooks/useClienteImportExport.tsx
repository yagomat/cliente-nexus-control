import { useState } from "react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { validateImportData, MissingDataItem, normalizeName } from "@/utils/dataValidation";

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
  const [missingDataItems, setMissingDataItems] = useState<MissingDataItem[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any[]>([]);

  // Estados válidos do Brasil
  const ESTADOS_VALIDOS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Funções de padronização
  const padronizarNome = (nome: string): string => {
    if (!nome) return '';
    return nome.trim().replace(/\s+/g, ' ');
  };

  const padronizarUF = (uf: string): string => {
    if (!uf) return '';
    return uf.trim().toUpperCase();
  };

  const padronizarTelefone = (telefone: string): string => {
    if (!telefone) return '';
    return telefone.replace(/\D/g, '');
  };

  const padronizarCodigoPais = (codigo: string): string => {
    if (!codigo) return '';
    return codigo.replace(/\D/g, '');
  };

  const padronizarValorPlano = (valor: string): number | null => {
    if (!valor) return null;
    
    // Remove símbolos monetários e caracteres não numéricos, exceto vírgula e ponto
    const valorLimpo = valor.toString()
      .replace(/[R$\s]/g, '')
      .replace(/[^\d,.]/g, '');
    
    // Trata vírgula como separador decimal brasileiro
    const valorFormatado = valorLimpo.replace(',', '.');
    
    const numeroValor = parseFloat(valorFormatado);
    return isNaN(numeroValor) ? null : numeroValor;
  };

  const padronizarTexto = (texto: string): string => {
    if (!texto) return '';
    return texto.trim().replace(/\s+/g, ' ');
  };

  const padronizarData = (data: string): string | null => {
    if (!data) return null;
    
    try {
      // Tentar diferentes formatos de data
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      ];

      for (const format of formats) {
        const match = data.match(format);
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

  // Função para padronizar dados de cliente
  const padronizarDadosCliente = (cliente: any) => {
    return {
      ...cliente,
      nome: padronizarNome(cliente.nome),
      uf: cliente.uf ? padronizarUF(cliente.uf) : null,
      telefone: cliente.telefone ? padronizarTelefone(cliente.telefone) : null,
      servidor: padronizarTexto(cliente.servidor),
      valor_plano: cliente.valor_plano ? padronizarValorPlano(cliente.valor_plano.toString()) : null,
      dispositivo_smart: cliente.dispositivo_smart ? padronizarTexto(cliente.dispositivo_smart) : null,
      aplicativo: padronizarTexto(cliente.aplicativo),
      usuario_aplicativo: cliente.usuario_aplicativo ? padronizarTexto(cliente.usuario_aplicativo) : null,
      senha_aplicativo: cliente.senha_aplicativo ? padronizarTexto(cliente.senha_aplicativo) : null,
      data_licenca_aplicativo: cliente.data_licenca_aplicativo ? padronizarData(cliente.data_licenca_aplicativo) : null,
      dispositivo_smart_2: cliente.dispositivo_smart_2 ? padronizarTexto(cliente.dispositivo_smart_2) : null,
      aplicativo_2: cliente.aplicativo_2 ? padronizarTexto(cliente.aplicativo_2) : null,
      usuario_aplicativo_2: cliente.usuario_aplicativo_2 ? padronizarTexto(cliente.usuario_aplicativo_2) : null,
      senha_aplicativo_2: cliente.senha_aplicativo_2 ? padronizarTexto(cliente.senha_aplicativo_2) : null,
      data_licenca_aplicativo_2: cliente.data_licenca_aplicativo_2 ? padronizarData(cliente.data_licenca_aplicativo_2) : null,
      observacoes: cliente.observacoes ? padronizarTexto(cliente.observacoes) : null,
    };
  };

  const exportarClientes = async (clientes: any[]) => {
    setIsExporting(true);
    try {
      // Preparar dados para exportação na ordem especificada
      const dadosExportacao = clientes.map(cliente => ({
        'Data de cadastro': new Date(cliente.created_at).toLocaleDateString('pt-BR'),
        'Nome': cliente.nome,
        'UF': cliente.uf || '',
        'Telefone': cliente.telefone || '',
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

  // Função para validar telefone (opcional)
  const validarTelefone = (telefone: string, linha: number, erros: ImportError[]) => {
    if (!telefone || telefone.trim() === '') {
      return true; // Telefone é opcional
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

  // Função para converter erros de banco em erros de validação
  const converterErroBanco = (error: any, clientesComErro: any[]): ImportError[] => {
    const errosConvertidos: ImportError[] = [];
    
    console.error('Erro do banco de dados:', error);
    
    if (error.message) {
      // Tentar identificar o tipo de erro e mapear para erros mais legíveis
      if (error.message.includes('violates not-null constraint')) {
        errosConvertidos.push({
          linha: 0,
          campo: 'Banco de dados',
          valor: '',
          erro: 'Campo obrigatório não pode estar vazio'
        });
      } else if (error.message.includes('value too long')) {
        errosConvertidos.push({
          linha: 0,
          campo: 'Banco de dados',
          valor: '',
          erro: 'Valor excede o tamanho máximo permitido'
        });
      } else if (error.message.includes('invalid input syntax')) {
        errosConvertidos.push({
          linha: 0,
          campo: 'Banco de dados',
          valor: '',
          erro: 'Formato de dados inválido'
        });
      } else {
        errosConvertidos.push({
          linha: 0,
          campo: 'Banco de dados',
          valor: '',
          erro: `Erro de banco: ${error.message}`
        });
      }
    } else {
      errosConvertidos.push({
        linha: 0,
        campo: 'Banco de dados',
        valor: '',
        erro: 'Erro desconhecido ao salvar no banco de dados'
      });
    }
    
    return errosConvertidos;
  };

  // Nova função para cadastrar itens aprovados automaticamente
  const createApprovedItems = async (approvedItems: MissingDataItem[]) => {
    const itemsToCreate = approvedItems.filter(item => item.action === 'create');
    
    console.log('Criando itens aprovados:', itemsToCreate);

    try {
      // Agrupar por tipo
      const servidores = itemsToCreate.filter(item => item.type === 'servidor');
      const aplicativos = itemsToCreate.filter(item => item.type === 'aplicativo');
      const dispositivos = itemsToCreate.filter(item => item.type === 'dispositivo');

      // Criar servidores
      if (servidores.length > 0) {
        const { error: servidoresError } = await supabase
          .from('servidores')
          .insert(servidores.map(item => ({
            nome: item.normalizedName,
            user_id: user!.id
          })));
        
        if (servidoresError) {
          console.error('Erro ao criar servidores:', servidoresError);
          throw servidoresError;
        }
      }

      // Criar aplicativos
      if (aplicativos.length > 0) {
        const { error: aplicativosError } = await supabase
          .from('aplicativos')
          .insert(aplicativos.map(item => ({
            nome: item.normalizedName,
            user_id: user!.id
          })));
        
        if (aplicativosError) {
          console.error('Erro ao criar aplicativos:', aplicativosError);
          throw aplicativosError;
        }
      }

      // Criar dispositivos
      if (dispositivos.length > 0) {
        const { error: dispositivosError } = await supabase
          .from('dispositivos')
          .insert(dispositivos.map(item => ({
            nome: item.normalizedName,
            user_id: user!.id
          })));
        
        if (dispositivosError) {
          console.error('Erro ao criar dispositivos:', dispositivosError);
          throw dispositivosError;
        }
      }

      const totalCreated = itemsToCreate.length;
      if (totalCreated > 0) {
        toast({
          title: "Itens cadastrados automaticamente",
          description: `${totalCreated} novo${totalCreated > 1 ? 's' : ''} item${totalCreated > 1 ? 's' : ''} cadastrado${totalCreated > 1 ? 's' : ''} com sucesso.`,
        });
      }

    } catch (error) {
      console.error('Erro ao criar itens aprovados:', error);
      throw error;
    }
  };

  // Função para buscar dados de referência
  const fetchReferenceData = async () => {
    if (!user) return null;

    try {
      const [servidoresRes, aplicativosRes, dispositivosRes] = await Promise.all([
        supabase.from('servidores').select('id, nome').eq('user_id', user.id),
        supabase.from('aplicativos').select('id, nome').eq('user_id', user.id),
        supabase.from('dispositivos').select('id, nome').eq('user_id', user.id)
      ]);

      return {
        servidores: servidoresRes.data || [],
        aplicativos: aplicativosRes.data || [],
        dispositivos: dispositivosRes.data || []
      };
    } catch (error) {
      console.error('Erro ao buscar dados de referência:', error);
      return null;
    }
  };

  // Função principal de importação atualizada
  const importarClientes = async (file: File): Promise<ImportResult> => {
    if (!user) return { success: false, clientesImportados: 0, clientesRejeitados: 0, erros: [], message: "Usuário não autenticado" };

    setIsImporting(true);
    try {
      // Buscar dados de referência
      const referenceData = await fetchReferenceData();
      if (!referenceData) {
        throw new Error("Erro ao carregar dados de referência");
      }

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
      const clientesParaValidar = [];
      const erros: ImportError[] = [];

      console.log(`Processando ${rows.length} linhas do arquivo`);

      // Primeira passagem: validação básica e coleta de dados
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const numeroLinha = i + 2;
        const errosLinha: ImportError[] = [];
        
        // Verificar se a linha tem dados suficientes
        if (!row[1] || row[1].toString().trim() === '') {
          continue; // Pular linhas vazias
        }

        const nome = padronizarNome(row[1]?.toString() || '');
        const uf = row[2] ? padronizarUF(row[2].toString()) : null;
        const telefone = row[3] ? padronizarTelefone(row[3].toString()) : null;
        const servidor = padronizarTexto(row[4]?.toString() || '');
        const diaVencimento = row[5]?.toString().trim();
        const valorPlano = row[6] ? padronizarValorPlano(row[6].toString()) : null;
        const dispositivoSmart = row[7] ? padronizarTexto(row[7].toString()) : null;
        const aplicativo = padronizarTexto(row[8]?.toString() || '');
        const usuarioAplicativo = row[9] ? padronizarTexto(row[9].toString()) : null;
        const senhaAplicativo = row[10] ? padronizarTexto(row[10].toString()) : null;
        const dataLicencaAplicativo = row[11] ? padronizarData(row[11].toString()) : null;
        const dispositivoSmart2 = row[12] ? padronizarTexto(row[12].toString()) : null;
        const aplicativo2 = row[13] ? padronizarTexto(row[13].toString()) : null;
        const usuarioAplicativo2 = row[14] ? padronizarTexto(row[14].toString()) : null;
        const senhaAplicativo2 = row[15] ? padronizarTexto(row[15].toString()) : null;
        const dataLicencaAplicativo2 = row[16] ? padronizarData(row[16].toString()) : null;
        const observacoes = row[17] ? padronizarTexto(row[17].toString()) : null;

        validarNome(nome, numeroLinha, errosLinha);
        validarUF(uf || '', numeroLinha, errosLinha);
        validarTelefone(telefone || '', numeroLinha, errosLinha);
        validarServidor(servidor, numeroLinha, errosLinha);
        validarDiaVencimento(diaVencimento, numeroLinha, errosLinha);
        validarValorPlano(valorPlano?.toString() || '', numeroLinha, errosLinha);
        validarAplicativo(aplicativo, numeroLinha, errosLinha);
        validarUsuarioAplicativo(usuarioAplicativo || '', 'Usuário do aplicativo 1', numeroLinha, errosLinha);
        validarSenhaAplicativo(senhaAplicativo || '', 'Senha do aplicativo 1', numeroLinha, errosLinha);
        validarUsuarioAplicativo(usuarioAplicativo2 || '', 'Usuário do aplicativo 2', numeroLinha, errosLinha);
        validarSenhaAplicativo(senhaAplicativo2 || '', 'Senha do aplicativo 2', numeroLinha, errosLinha);
        validarObservacoes(observacoes || '', numeroLinha, errosLinha);

        if (errosLinha.length > 0) {
          erros.push(...errosLinha);
          continue;
        }

        // Montar cliente válido
        const cliente = {
          nome,
          uf,
          telefone,
          servidor,
          dia_vencimento: parseInt(diaVencimento),
          valor_plano: valorPlano,
          dispositivo_smart: dispositivoSmart,
          aplicativo,
          usuario_aplicativo: usuarioAplicativo,
          senha_aplicativo: senhaAplicativo,
          data_licenca_aplicativo: dataLicencaAplicativo,
          dispositivo_smart_2: dispositivoSmart2,
          aplicativo_2: aplicativo2,
          usuario_aplicativo_2: usuarioAplicativo2,
          senha_aplicativo_2: senhaAplicativo2,
          data_licenca_aplicativo_2: dataLicencaAplicativo2,
          observacoes,
          user_id: user.id,
          tela_adicional: !!(dispositivoSmart2 || aplicativo2)
        };

        clientesParaValidar.push(cliente);
      }

      // Se há erros de validação básica, mostrar e parar
      if (erros.length > 0) {
        setImportErrors(erros);
        setShowErrorDialog(true);
        return { 
          success: false, 
          clientesImportados: 0, 
          clientesRejeitados: erros.length, 
          erros 
        };
      }

      // Segunda passagem: validação de dados de referência
      const allMissingItems: MissingDataItem[] = [];
      
      for (const cliente of clientesParaValidar) {
        const missingItems = validateImportData(cliente, referenceData);
        
        // Adicionar apenas itens únicos
        for (const missing of missingItems) {
          const exists = allMissingItems.some(item => 
            item.type === missing.type && 
            item.originalName === missing.originalName
          );
          
          if (!exists) {
            allMissingItems.push(missing);
          }
        }
      }

      // Se há itens não cadastrados, mostrar modal de aprovação
      if (allMissingItems.length > 0) {
        console.log('Itens não cadastrados encontrados:', allMissingItems);
        setMissingDataItems(allMissingItems);
        setPendingImportData(clientesParaValidar);
        setShowApprovalModal(true);
        
        return { 
          success: false, 
          clientesImportados: 0, 
          clientesRejeitados: 0, 
          erros: [],
          message: "Aguardando aprovação de novos itens"
        };
      }

      // Terceira passagem: importação dos clientes
      return await executeImport(clientesParaValidar);

    } catch (error) {
      console.error('Erro geral na importação:', error);
      const message = error instanceof Error ? error.message : "Erro desconhecido na importação";
      
      const erroGeral: ImportError[] = [{
        linha: 0,
        campo: 'Sistema',
        valor: '',
        erro: message
      }];
      
      setImportErrors(erroGeral);
      setShowErrorDialog(true);
      
      toast({
        title: "Erro na importação",
        description: message,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        clientesImportados: 0, 
        clientesRejeitados: 0, 
        erros: erroGeral, 
        message 
      };
    } finally {
      setIsImporting(false);
    }
  };

  // Função para executar a importação após aprovação
  const executeImport = async (clientesParaImportar: any[]): Promise<ImportResult> => {
    if (clientesParaImportar.length === 0) {
      return { success: true, clientesImportados: 0, clientesRejeitados: 0, erros: [] };
    }

    try {
      console.log(`Tentando inserir ${clientesParaImportar.length} clientes no banco`);
      
      const { data, error } = await supabase
        .from('clientes')
        .insert(clientesParaImportar)
        .select();

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        
        const errosBanco = converterErroBanco(error, clientesParaImportar);
        setImportErrors(errosBanco);
        setShowErrorDialog(true);
        
        return { 
          success: false, 
          clientesImportados: 0, 
          clientesRejeitados: clientesParaImportar.length, 
          erros: errosBanco 
        };
      }

      const clientesImportados = clientesParaImportar.length;
      console.log(`${clientesImportados} clientes inseridos com sucesso`);

      toast({
        title: "Importação concluída",
        description: `${clientesImportados} cliente(s) importado(s) com sucesso.`,
      });

      return { 
        success: true, 
        clientesImportados, 
        clientesRejeitados: 0, 
        erros: [] 
      };
    } catch (error) {
      console.error('Erro na execução da importação:', error);
      throw error;
    }
  };

  // Função para processar aprovação dos itens
  const handleApprovalComplete = async (approvedItems: MissingDataItem[]): Promise<ImportResult> => {
    try {
      console.log('Processando aprovação:', approvedItems);
      
      // Criar itens aprovados automaticamente
      await createApprovedItems(approvedItems);
      
      // Filtrar clientes que devem ser importados (não pular)
      const itemsToSkip = approvedItems
        .filter(item => item.action === 'skip')
        .map(item => item.originalName.toLowerCase());
      
      console.log('Itens para pular:', itemsToSkip);
      
      const clientesToImport = pendingImportData.filter(cliente => {
        // Verificar se algum campo do cliente deve ser pulado
        const shouldSkip = [
          cliente.servidor,
          cliente.aplicativo,
          cliente.aplicativo_2,
          cliente.dispositivo_smart,
          cliente.dispositivo_smart_2
        ].some(field => field && itemsToSkip.includes(field.toLowerCase()));
        
        return !shouldSkip;
      });
      
      console.log(`${clientesToImport.length} clientes serão importados após filtros`);
      
      // Executar importação
      const result = await executeImport(clientesToImport);
      
      // Limpar estados
      setShowApprovalModal(false);
      setMissingDataItems([]);
      setPendingImportData([]);
      
      return result;
      
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      
      toast({
        title: "Erro ao processar aprovação",
        description: "Ocorreu um erro ao cadastrar os novos itens.",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  // Função auxiliar para converter string de data para formato ISO
  const parseDateFromString = (dateString: string): string | null => {
    return padronizarData(dateString);
  };

  return {
    exportarClientes,
    importarClientes,
    padronizarDadosCliente,
    isExporting,
    isImporting,
    importErrors,
    showErrorDialog,
    setShowErrorDialog,
    missingDataItems,
    showApprovalModal,
    setShowApprovalModal,
    handleApprovalComplete
  };
};
