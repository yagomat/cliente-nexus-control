-- Criar função SQL personalizada para execução de queries dinâmicas (versão simplificada)
CREATE OR REPLACE FUNCTION public.exec_sql(query text, params json DEFAULT '[]'::json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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