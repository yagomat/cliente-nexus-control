-- Add codigo_pais column to clientes table
ALTER TABLE public.clientes 
ADD COLUMN codigo_pais TEXT DEFAULT '55';