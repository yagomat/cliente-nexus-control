-- Habilitar realtime para a tabela pagamentos
ALTER TABLE public.pagamentos REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos;