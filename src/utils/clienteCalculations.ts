// Local client calculations - copied from backend edge function for optimized UX
// This ensures only specific cards update instead of reloading entire client list

export interface VencimentoInfo {
  dias: number;
  texto: string;
  vencido: boolean;
}

export const calcularStatusCliente = (cliente: any, getPagamentoDoMes: (clienteId: string, mes: number, ano: number) => any) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const diaHoje = hoje.getDate();
  
  // Verificar pagamento do mês atual
  const pagamentoMesAtual = getPagamentoDoMes(cliente.id, mesAtual, anoAtual);
  if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
    return true;
  }
  
  // Se estamos antes do dia de vencimento, verificar mês anterior
  if (diaHoje <= cliente.dia_vencimento) {
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = anoAtual - 1;
    }
    
    const pagamentoMesAnterior = getPagamentoDoMes(cliente.id, mesAnterior, anoAnterior);
    if (pagamentoMesAnterior && (pagamentoMesAnterior.status === 'pago' || pagamentoMesAnterior.status === 'promocao')) {
      return true;
    }
  }
  
  return false;
};

export const calcularVencimentoInteligente = (cliente: any, getPagamentoDoMes: (clienteId: string, mes: number, ano: number) => any): VencimentoInfo => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const diaHoje = hoje.getDate();
  
  const clienteAtivo = calcularStatusCliente(cliente, getPagamentoDoMes);
  
  if (clienteAtivo) {
    // Cliente ativo: calcular próximo vencimento
    let proximoMes = mesAtual;
    let proximoAno = anoAtual;
    
    // Se já passou do dia de vencimento neste mês, próximo vencimento é no próximo mês
    if (diaHoje > cliente.dia_vencimento) {
      proximoMes++;
      if (proximoMes > 12) {
        proximoMes = 1;
        proximoAno++;
      }
    }
    
    // Procurar o primeiro mês não pago
    for (let i = 0; i < 12; i++) {
      const pagamento = getPagamentoDoMes(cliente.id, proximoMes, proximoAno);
      
      if (!pagamento || (pagamento.status !== 'pago' && pagamento.status !== 'promocao')) {
        // Calcular dias até o vencimento deste mês
        const ultimoDiaDoMes = new Date(proximoAno, proximoMes, 0).getDate();
        const diaEfetivo = Math.min(cliente.dia_vencimento, ultimoDiaDoMes);
        const dataVencimento = new Date(proximoAno, proximoMes - 1, diaEfetivo);
        
        const diffTime = dataVencimento.getTime() - hoje.getTime();
        const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          dias,
          texto: dias === 0 ? `Vence hoje` : dias === 1 ? `Vence amanhã` : dias > 0 ? `Vence em ${dias} dias` : `Venceu há ${Math.abs(dias)} dias`,
          vencido: dias < 0
        };
      }
      
      // Avançar para próximo mês
      proximoMes++;
      if (proximoMes > 12) {
        proximoMes = 1;
        proximoAno++;
      }
    }
    
    return {
      dias: 365,
      texto: 'Pago por 12+ meses',
      vencido: false
    };
  } else {
    // Cliente inativo: encontrar último pagamento e calcular desde quando está vencido
    let mes = mesAtual;
    let ano = anoAtual;
    let ultimoPagamentoEncontrado = false;
    
    // Começar verificando o mês atual e ir voltando
    for (let i = 0; i < 24; i++) { // Buscar até 2 anos atrás
      const pagamento = getPagamentoDoMes(cliente.id, mes, ano);
      
      if (pagamento && (pagamento.status === 'pago' || pagamento.status === 'promocao')) {
        ultimoPagamentoEncontrado = true;
        
        // Próximo vencimento seria no mês seguinte ao último pago
        let proximoMes = mes + 1;
        let proximoAno = ano;
        if (proximoMes > 12) {
          proximoMes = 1;
          proximoAno++;
        }
        
        const ultimoDiaDoMes = new Date(proximoAno, proximoMes, 0).getDate();
        const diaEfetivo = Math.min(cliente.dia_vencimento, ultimoDiaDoMes);
        const dataVencimento = new Date(proximoAno, proximoMes - 1, diaEfetivo);
        
        const diffTime = hoje.getTime() - dataVencimento.getTime();
        const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          dias: Math.abs(dias),
          texto: dias === 0 ? 'Vence hoje' : `Venceu há ${Math.abs(dias)} dias`,
          vencido: true
        };
      }
      
      // Voltar um mês
      mes--;
      if (mes < 1) {
        mes = 12;
        ano--;
      }
    }
    
    if (!ultimoPagamentoEncontrado) {
      // Nunca pagou - não calcular vencimento pois não há histórico
      return {
        dias: 0,
        texto: 'Nunca pagou',
        vencido: false
      };
    }
    
    return {
      dias: 9999,
      texto: 'Sem histórico recente',
      vencido: true
    };
  }
};