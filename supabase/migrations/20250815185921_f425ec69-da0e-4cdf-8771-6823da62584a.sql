-- Corrigir problema de search_path nas funções
CREATE OR REPLACE FUNCTION public.exec_sql(query text, params json DEFAULT '[]'::json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    result json;
    param1 text;
    param2 text;
    param3 text;
    param4 text;
    param5 text;
BEGIN
    -- Extrair parâmetros do JSON (suportando até 5 parâmetros)
    IF json_array_length(params) >= 1 THEN param1 := params->>0; END IF;
    IF json_array_length(params) >= 2 THEN param2 := params->>1; END IF;
    IF json_array_length(params) >= 3 THEN param3 := params->>2; END IF;
    IF json_array_length(params) >= 4 THEN param4 := params->>3; END IF;
    IF json_array_length(params) >= 5 THEN param5 := params->>4; END IF;
    
    -- Executar query com parâmetros baseado no número de parâmetros
    IF json_array_length(params) = 0 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result;
    ELSIF json_array_length(params) = 1 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result USING param1;
    ELSIF json_array_length(params) = 2 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result USING param1, param2;
    ELSIF json_array_length(params) = 3 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result USING param1, param2, param3;
    ELSIF json_array_length(params) = 4 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result USING param1, param2, param3, param4;
    ELSIF json_array_length(params) = 5 THEN
        EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result USING param1, param2, param3, param4, param5;
    END IF;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Corrigir as outras funções existentes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome');
  RETURN NEW;
END;
$$;