
-- Alterar a coluna telefone para aceitar valores nulos
ALTER TABLE public.clientes 
ALTER COLUMN telefone DROP NOT NULL;
