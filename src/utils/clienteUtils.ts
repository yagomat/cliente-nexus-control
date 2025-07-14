export const calcularDiasParaVencer = (diaVencimento: number) => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  let proximoVencimento = new Date(anoAtual, mesAtual, diaVencimento);
  
  if (proximoVencimento < hoje) {
    proximoVencimento = new Date(anoAtual, mesAtual + 1, diaVencimento);
  }
  
  const diffTime = proximoVencimento.getTime() - hoje.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calcularStatusCliente = (cliente: any, getPagamentoMesAtual: (clienteId: string) => any) => {
  const diasParaVencer = calcularDiasParaVencer(cliente.dia_vencimento);
  const pagamentoMesAtual = getPagamentoMesAtual(cliente.id);
  
  // Cliente está ativo se:
  // - Pagou este mês (status 'pago' ou 'promocao') E ainda não venceu
  // - Ou se pagou e ainda não passou do dia de vencimento
  if (pagamentoMesAtual && (pagamentoMesAtual.status === 'pago' || pagamentoMesAtual.status === 'promocao')) {
    return diasParaVencer >= 0;
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