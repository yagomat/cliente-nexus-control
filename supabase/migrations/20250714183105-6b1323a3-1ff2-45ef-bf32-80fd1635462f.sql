-- Criar tabela para templates de WhatsApp
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view their own templates" 
ON public.templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir templates padrão para todos os usuários existentes
INSERT INTO public.templates (user_id, nome, tipo, mensagem, is_default)
SELECT 
  profiles.user_id,
  'A Vencer',
  'a_vencer',
  '{saudacao} {nome}! Seu plano vence em {dias_vencimento}. Valor: R$ {valor_plano}. Renove em breve!',
  true
FROM public.profiles
UNION ALL
SELECT 
  profiles.user_id,
  'Vence Hoje',
  'vence_hoje',
  '{saudacao} {nome}! Seu plano vence hoje, dia {data_vencimento}. Valor: R$ {valor_plano}. Renove agora!',
  true
FROM public.profiles
UNION ALL
SELECT 
  profiles.user_id,
  'Vencido',
  'vencido',
  '{saudacao} {nome}! Seu plano está vencido há {dias_vencimento}. Valor: R$ {valor_plano}. Regularize já!',
  true
FROM public.profiles
UNION ALL
SELECT 
  profiles.user_id,
  'Pago',
  'pago',
  '{saudacao} {nome}! Pagamento confirmado no valor de R$ {valor_plano}. Obrigado!',
  true
FROM public.profiles;