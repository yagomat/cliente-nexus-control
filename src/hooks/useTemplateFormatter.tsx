import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface TemplateData {
  cliente: any;
  pagamento?: any;
  vencimentoInfo?: any;
}

export const useTemplateFormatter = () => {
  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatTemplate = useCallback((template: string, data: TemplateData) => {
    const { cliente, vencimentoInfo } = data;
    
    const placeholders = {
      '{nome}': cliente.nome || '',
      '{primeiro_nome}': cliente.nome ? cliente.nome.split(' ')[0] : '',
      '{telefone}': cliente.telefone || '',
      '{valor_plano}': cliente.valor_plano ? cliente.valor_plano.toFixed(2) : '0,00',
      '{servidor}': cliente.servidor || '',
      '{aplicativo}': cliente.aplicativo || '',
      '{usuario_aplicativo}': cliente.usuario_aplicativo || '',
      '{senha_aplicativo}': cliente.senha_aplicativo || '',
      '{saudacao}': getSaudacao(),
      '{data_vencimento}': vencimentoInfo?.dataVencimento 
        ? format(vencimentoInfo.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })
        : `${cliente.dia_vencimento}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      '{dias_vencimento}': vencimentoInfo?.texto || `${cliente.dia_vencimento} dias`,
      '{uf}': cliente.uf || '',
      '{observacoes}': cliente.observacoes || ''
    };

    let formattedMessage = template;
    
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      formattedMessage = formattedMessage.replace(regex, value);
    });

    return formattedMessage;
  }, []);

  const formatForWhatsApp = (message: string, telefone: string) => {
    const phoneNumber = telefone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  };

  const availableVariables = useMemo(() => [
    { key: '{nome}', description: 'Nome completo do cliente' },
    { key: '{primeiro_nome}', description: 'Primeiro nome do cliente' },
    { key: '{valor_plano}', description: 'Valor do plano' },
    { key: '{aplicativo}', description: 'Aplicativo IPTV' },
    { key: '{saudacao}', description: 'Saudação baseada na hora' },
    { key: '{data_vencimento}', description: 'Data de vencimento' },
    { key: '{dias_vencimento}', description: 'Dias para vencimento' }
  ], []);

  return {
    formatTemplate,
    formatForWhatsApp,
    availableVariables,
    getSaudacao
  };
};