-- Create tables for cadastro data
CREATE TABLE public.servidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.aplicativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.valores_plano (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valor DECIMAL(10,2) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valores_plano ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for servidores
CREATE POLICY "Users can view their own servidores" 
ON public.servidores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own servidores" 
ON public.servidores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servidores" 
ON public.servidores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servidores" 
ON public.servidores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for aplicativos
CREATE POLICY "Users can view their own aplicativos" 
ON public.aplicativos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aplicativos" 
ON public.aplicativos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aplicativos" 
ON public.aplicativos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aplicativos" 
ON public.aplicativos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for dispositivos
CREATE POLICY "Users can view their own dispositivos" 
ON public.dispositivos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dispositivos" 
ON public.dispositivos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dispositivos" 
ON public.dispositivos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dispositivos" 
ON public.dispositivos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for valores_plano
CREATE POLICY "Users can view their own valores_plano" 
ON public.valores_plano 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own valores_plano" 
ON public.valores_plano 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own valores_plano" 
ON public.valores_plano 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own valores_plano" 
ON public.valores_plano 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_servidores_updated_at
BEFORE UPDATE ON public.servidores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aplicativos_updated_at
BEFORE UPDATE ON public.aplicativos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispositivos_updated_at
BEFORE UPDATE ON public.dispositivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_valores_plano_updated_at
BEFORE UPDATE ON public.valores_plano
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();