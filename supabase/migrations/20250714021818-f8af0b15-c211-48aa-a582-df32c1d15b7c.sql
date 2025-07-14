-- Criar tabela para registrar pagamentos mensais
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  user_id UUID NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pago', 'promocao', 'removido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, mes, ano)
);

-- Enable Row Level Security
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own payments" 
ON public.pagamentos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.pagamentos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.pagamentos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" 
ON public.pagamentos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pagamentos_updated_at
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();