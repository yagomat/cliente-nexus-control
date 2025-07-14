-- Add fields for second screen to clientes table
ALTER TABLE public.clientes 
ADD COLUMN dispositivo_smart_2 TEXT,
ADD COLUMN aplicativo_2 TEXT,
ADD COLUMN usuario_aplicativo_2 TEXT,
ADD COLUMN senha_aplicativo_2 TEXT,
ADD COLUMN data_licenca_aplicativo_2 DATE;