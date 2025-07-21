
// Função auxiliar para calcular a data de vencimento real considerando meses com menos dias
const calcularDataVencimentoReal = (ano: number, mes: number, diaVencimento: number): Date => {
  // Primeiro, criar uma data com o primeiro dia do mês
  const primeiroDiaDoMes = new Date(ano, mes - 1, 1);
  
  // Calcular o último dia do mês
  const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
  
  // Se o dia de vencimento existe no mês, usar ele
  // Caso contrário, usar o último dia do mês
  const diaEfetivo = Math.min(diaVencimento, ultimoDiaDoMes);
  
  return new Date(ano, mes - 1, diaEfetivo);
};

export const calcularVencimentoInteligente = (cliente: any, getPagamentoDoMes: (clienteId: string, mes: number, ano: number) => any) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Verificar se cliente está ativo
  const clienteAtivo = calcularStatusCliente(cliente, getPagamentoDoMes);
  
  if (clienteAtivo) {
    // Cliente ativo: encontrar primeiro gap nos pagamentos futuros
    let mes = mesAtual;
    let ano = anoAtual;
    
    // Percorrer meses consecutivos para encontrar o primeiro gap
    for (let i = 0; i < 12; i++) {
      const pagamento = getPagamentoDoMes(cliente.id, mes, ano);
      
      // Se não tem pagamento ou status não é válido, encontrou o gap
      if (!pagamento || (pagamento.status !== 'pago' && pagamento.status !== 'promocao')) {
        // Calcular dias até o vencimento deste mês (quando cliente se tornará inativo)
        const dataVencimento = calcularDataVencimentoReal(ano, mes, cliente.dia_vencimento);
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          dias,
          texto: dias <= 0 ? `Vence hoje` : `Vence em ${dias} dias`,
          vencido: false
        };
      }
      
      // Avançar para próximo mês
      mes++;
      if (mes > 12) {
        mes = 1;
        ano++;
      }
    }
    
    // Se não encontrou gap em 12 meses, usar último mês verificado
    const dataVencimento = calcularDataVencimentoReal(ano, mes, cliente.dia_vencimento);
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      dias,
      texto: `Vence em ${dias} dias`,
      vencido: false
    };
  } else {
    // Cliente inativo: encontrar quando se tornou inativo
    let mes = mesAtual;
    let ano = anoAtual;
    
    // Buscar o último mês pago no passado
    for (let i = 0; i < 12; i++) {
      mes--;
      if (mes < 1) {
        mes = 12;
        ano--;
      }
      
      const pagamento = getPagamentoDoMes(cliente.id, mes, ano);
      if (pagamento && (pagamento.status === 'pago' || pagamento.status === 'promocao')) {
        // Encontrou último mês pago, cliente se tornou inativo no mês seguinte
        let mesInativo = mes + 1;
        let anoInativo = ano;
        if (mesInativo > 12) {
          mesInativo = 1;
          anoInativo++;
        }
        
        const dataVencimento = calcularDataVencimentoReal(anoInativo, mesInativo, cliente.dia_vencimento);
        const diffTime = hoje.getTime() - dataVencimento.getTime();
        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          dias,
          texto: `Venceu há ${dias} dias`,
          vencido: true
        };
      }
    }
    
    // Se não encontrou histórico de pagamento, não mostrar informação
    return null;
  }
};

export const calcularDiasParaVencer = (diaVencimento: number) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Calcular próximo vencimento usando a função auxiliar
  let proximoVencimento = calcularDataVencimentoReal(anoAtual, mesAtual, diaVencimento);
  
  // Se já passou do vencimento deste mês, calcular para o próximo mês
  if (proximoVencimento < hoje) {
    let proximoMes = mesAtual + 1;
    let proximoAno = anoAtual;
    
    if (proximoMes > 12) {
      proximoMes = 1;
      proximoAno++;
    }
    
    proximoVencimento = calcularDataVencimentoReal(proximoAno, proximoMes, diaVencimento);
  }
  
  const diffTime = proximoVencimento.getTime() - hoje.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calcularStatusCliente = (cliente: any, getPagamentoDoMes: (clienteId: string, mes: number, ano: number) => any) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  // Buscar pagamento do mês atual
  const pagamentoMesAtual = getPagamentoDoMes(cliente.id, mesAtual, anoAtual);
  
  // Se tem pagamento no mês atual como pago/promoção, está ativo
  if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
    return true;
  }
  
  // Calcular mês anterior
  let mesAnterior = mesAtual - 1;
  let anoAnterior = anoAtual;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = anoAtual - 1;
  }
  
  // Buscar pagamento do mês anterior
  const pagamentoMesAnterior = getPagamentoDoMes(cliente.id, mesAnterior, anoAnterior);
  
  // Se tem pagamento no mês anterior como pago/promoção E ainda não passou do dia de vencimento
  if (pagamentoMesAnterior && (pagamentoMesAnterior.status === 'pago' || pagamentoMesAnterior.status === 'promocao')) {
    // Calcular data de vencimento real do mês atual
    const dataVencimento = calcularDataVencimentoReal(anoAtual, mesAtual, cliente.dia_vencimento);
    return hoje <= dataVencimento;
  }
  
  return false;
};

export const getButtonVariantAndColor = (clienteId: string, getPagamentoMesAtual: (clienteId: string) => any) => {
  const pagamento = getPagamentoMesAtual(clienteId);
  
  if (!pagamento || pagamento.status === 'removido') {
    return { variant: "destructive" as const, className: "bg-red-500 hover:bg-red-600", icon: "X" };
  }
  
  if (pagamento.status === 'pago') {
    return { variant: "default" as const, className: "bg-green-500 hover:bg-green-600", icon: "Check" };
  }
  
  if (pagamento.status === 'promocao') {
    return { variant: "default" as const, className: "bg-blue-500 hover:bg-blue-600", icon: "Check" };
  }
  
  return { variant: "destructive" as const, className: "bg-red-500 hover:bg-red-600", icon: "X" };
};

export const getVencimentoColor = (dias: number) => {
  if (dias < 0) return "text-red-600 font-medium";
  if (dias <= 5) return "text-yellow-600 font-medium";
  return "text-foreground";
};

export const getVencimentoTexto = (dias: number) => {
  if (dias < 0) return `Venceu há ${Math.abs(dias)} dias`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dias`;
};
