-- Criar função SQL personalizada para execução de queries dinâmicas
CREATE OR REPLACE FUNCTION public.exec_sql(query text, params json DEFAULT '[]'::json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    param_values text[];
    i integer;
BEGIN
    -- Converter parâmetros JSON para array de texto
    IF params IS NOT NULL AND json_array_length(params) > 0 THEN
        FOR i IN 0..json_array_length(params)-1 LOOP
            param_values := array_append(param_values, (params->>i));
        END LOOP;
    END IF;
    
    -- Executar query e retornar resultado como JSON
    EXECUTE 'SELECT to_json(array_agg(row_to_json(t))) FROM (' || query || ') t'
    INTO result
    USING VARIADIC param_values;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;