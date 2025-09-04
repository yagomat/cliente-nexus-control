// UI utility functions for client management
// Note: Business logic calculations are handled by backend edge functions

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
