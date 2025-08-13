-- Add soft delete column to clientes table
ALTER TABLE public.clientes 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for better performance on non-deleted clients
CREATE INDEX idx_clientes_not_deleted ON public.clientes (user_id) WHERE deleted_at IS NULL;