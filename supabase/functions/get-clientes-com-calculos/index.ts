import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClienteComCalculos {
  id: string;
  nome: string;
  telefone: string | null;
  uf: string | null;
  servidor: string;
  dispositivo_smart: string | null;
  aplicativo: string;
  usuario_aplicativo: string | null;
  senha_aplicativo: string | null;
  observacoes: string | null;
  codigo_pais: string;
  dia_vencimento: number;
  valor_plano: number | null;
  data_licenca_aplicativo: string | null;
  tela_adicional: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  aplicativo_2: string | null;
  usuario_aplicativo_2: string | null;
  senha_aplicativo_2: string | null;
  data_licenca_aplicativo_2: string | null;
  dispositivo_smart_2: string | null;
  // Campos calculados
  status_ativo: boolean;
  vencimento_dias: number | null;
  vencimento_texto: string | null;
  vencimento_vencido: boolean;
  ordem_vencimento: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      search = '',
      status = 'todos',
      ordenacao = 'cadastro_asc',
      page = 1,
      itemsPerPage = 10,
      ano = new Date().getFullYear()
    } = await req.json();

    console.log(`Processing advanced calculation request: search="${search}", status="${status}", ordenacao="${ordenacao}", page=${page}, itemsPerPage=${itemsPerPage}, ano=${ano}`);

    // Função SQL para calcular vencimento inteligente
    const calcularVencimentoSQL = `
      WITH pagamentos_cliente AS (
        SELECT DISTINCT p.cliente_id, p.mes, p.ano, p.status
        FROM pagamentos p
        WHERE p.user_id = $1 AND p.ano = $2
      ),
      clientes_com_status AS (
        SELECT 
          c.*,
          -- Verificar se cliente está ativo
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM pagamentos_cliente pc 
              WHERE pc.cliente_id = c.id 
              AND pc.mes = EXTRACT(MONTH FROM NOW()) 
              AND pc.ano = EXTRACT(YEAR FROM NOW())
              AND pc.status IN ('pago', 'promocao')
            ) THEN true
            WHEN EXISTS (
              SELECT 1 FROM pagamentos_cliente pc 
              WHERE pc.cliente_id = c.id 
              AND pc.mes = CASE 
                WHEN EXTRACT(MONTH FROM NOW()) = 1 THEN 12 
                ELSE EXTRACT(MONTH FROM NOW()) - 1 
              END
              AND pc.ano = CASE 
                WHEN EXTRACT(MONTH FROM NOW()) = 1 THEN EXTRACT(YEAR FROM NOW()) - 1 
                ELSE EXTRACT(YEAR FROM NOW()) 
              END
              AND pc.status IN ('pago', 'promocao')
            ) AND (
              -- Ainda não passou do dia de vencimento
              EXTRACT(DAY FROM NOW()) <= LEAST(c.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', NOW()) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))
            ) THEN true
            ELSE false
          END as status_ativo
        FROM clientes c
        WHERE c.user_id = $1 
        AND c.deleted_at IS NULL 
        AND c.ativo = true
      ),
      clientes_com_vencimento AS (
        SELECT 
          ccs.*,
          -- Calcular dias para vencimento
          CASE 
            WHEN ccs.status_ativo THEN (
              -- Cliente ativo: encontrar primeiro gap
              SELECT COALESCE(
                (
                  WITH RECURSIVE meses_consecutivos AS (
                    SELECT 
                      EXTRACT(MONTH FROM NOW())::integer as mes,
                      EXTRACT(YEAR FROM NOW())::integer as ano,
                      0 as contador
                    UNION ALL
                    SELECT 
                      CASE WHEN mc.mes = 12 THEN 1 ELSE mc.mes + 1 END,
                      CASE WHEN mc.mes = 12 THEN mc.ano + 1 ELSE mc.ano END,
                      mc.contador + 1
                    FROM meses_consecutivos mc
                    WHERE mc.contador < 12
                  )
                  SELECT 
                    DATE_PART('day', 
                      DATE(mc.ano, mc.mes, LEAST(ccs.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', DATE(mc.ano, mc.mes, 1)) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))) - NOW()
                    )::integer
                  FROM meses_consecutivos mc
                  LEFT JOIN pagamentos_cliente pc ON pc.cliente_id = ccs.id AND pc.mes = mc.mes AND pc.ano = mc.ano
                  WHERE pc.cliente_id IS NULL OR pc.status NOT IN ('pago', 'promocao')
                  ORDER BY mc.contador
                  LIMIT 1
                ),
                -- Fallback: próximo vencimento
                DATE_PART('day', 
                  CASE 
                    WHEN EXTRACT(DAY FROM NOW()) <= LEAST(ccs.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', NOW()) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))
                    THEN DATE(EXTRACT(YEAR FROM NOW()), EXTRACT(MONTH FROM NOW()), LEAST(ccs.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', NOW()) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')))
                    ELSE DATE(
                      CASE WHEN EXTRACT(MONTH FROM NOW()) = 12 THEN EXTRACT(YEAR FROM NOW()) + 1 ELSE EXTRACT(YEAR FROM NOW()) END,
                      CASE WHEN EXTRACT(MONTH FROM NOW()) = 12 THEN 1 ELSE EXTRACT(MONTH FROM NOW()) + 1 END,
                      LEAST(ccs.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', DATE(
                        CASE WHEN EXTRACT(MONTH FROM NOW()) = 12 THEN EXTRACT(YEAR FROM NOW()) + 1 ELSE EXTRACT(YEAR FROM NOW()) END,
                        CASE WHEN EXTRACT(MONTH FROM NOW()) = 12 THEN 1 ELSE EXTRACT(MONTH FROM NOW()) + 1 END,
                        1
                      )) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))
                    )
                  END - NOW()
                )::integer
              )
            )
            ELSE (
              -- Cliente inativo: encontrar quando se tornou inativo
              WITH ultimo_pago AS (
                SELECT MAX(pc.ano * 12 + pc.mes) as ultimo_mes_pago
                FROM pagamentos_cliente pc 
                WHERE pc.cliente_id = ccs.id AND pc.status IN ('pago', 'promocao')
              )
              SELECT 
                -DATE_PART('day', NOW() - DATE(
                  ((up.ultimo_mes_pago + 1 - 1) / 12)::integer,
                  ((up.ultimo_mes_pago + 1 - 1) % 12) + 1,
                  LEAST(ccs.dia_vencimento, EXTRACT(DAY FROM DATE_TRUNC('MONTH', DATE(
                    ((up.ultimo_mes_pago + 1 - 1) / 12)::integer,
                    ((up.ultimo_mes_pago + 1 - 1) % 12) + 1,
                    1
                  )) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))
                ))::integer
              FROM ultimo_pago up
              WHERE up.ultimo_mes_pago IS NOT NULL
            )
          END as vencimento_dias
        FROM clientes_com_status ccs
      )
      SELECT 
        ccv.*,
        -- Texto do vencimento
        CASE 
          WHEN ccv.vencimento_dias IS NULL THEN NULL
          WHEN ccv.vencimento_dias < 0 THEN 'Venceu há ' || ABS(ccv.vencimento_dias) || ' dias'
          WHEN ccv.vencimento_dias = 0 THEN 'Vence hoje'
          ELSE 'Vence em ' || ccv.vencimento_dias || ' dias'
        END as vencimento_texto,
        -- Se está vencido
        COALESCE(ccv.vencimento_dias < 0, false) as vencimento_vencido,
        -- Ordem para vencimento (vencidos primeiro, depois próximos)
        CASE 
          WHEN ccv.vencimento_dias IS NULL THEN 9999
          WHEN ccv.vencimento_dias < 0 THEN ccv.vencimento_dias
          ELSE ccv.vencimento_dias
        END as ordem_vencimento
      FROM clientes_com_vencimento ccv
    `;

    // Executar query principal
    let query = `
      WITH dados_calculados AS (${calcularVencimentoSQL})
      SELECT * FROM dados_calculados
      WHERE 1=1
    `;

    const params = [user.id, ano];
    let paramCount = 2;

    // Aplicar filtros
    if (search.trim()) {
      paramCount++;
      query += ` AND nome ILIKE $${paramCount}`;
      params.push(`%${search.trim()}%`);
    }

    if (status !== 'todos') {
      paramCount++;
      if (status === 'ativo') {
        query += ` AND status_ativo = $${paramCount}`;
        params.push(true);
      } else if (status === 'inativo') {
        query += ` AND status_ativo = $${paramCount}`;
        params.push(false);
      } else if (status === 'vencido') {
        query += ` AND vencimento_vencido = $${paramCount}`;
        params.push(true);
      }
    }

    // Aplicar ordenação
    let orderBy = 'created_at ASC';
    switch (ordenacao) {
      case 'nome_asc':
        orderBy = 'nome ASC';
        break;
      case 'nome_desc':
        orderBy = 'nome DESC';
        break;
      case 'vencimento_asc':
        orderBy = 'ordem_vencimento ASC, nome ASC';
        break;
      case 'vencimento_desc':
        orderBy = 'ordem_vencimento DESC, nome ASC';
        break;
      case 'cadastro_desc':
        orderBy = 'created_at DESC';
        break;
      default:
        orderBy = 'created_at ASC';
    }

    query += ` ORDER BY ${orderBy}`;

    // Contar total antes da paginação
    const countQuery = `
      WITH dados_calculados AS (${calcularVencimentoSQL})
      SELECT COUNT(*) as total FROM dados_calculados
      WHERE 1=1
      ${search.trim() ? ` AND nome ILIKE $${params.findIndex(p => p === `%${search.trim()}%`) + 1}` : ''}
      ${status === 'ativo' ? ' AND status_ativo = true' : ''}
      ${status === 'inativo' ? ' AND status_ativo = false' : ''}
      ${status === 'vencido' ? ' AND vencimento_vencido = true' : ''}
    `;

    const { data: countData, error: countError } = await supabase.rpc('exec_sql', {
      query: countQuery,
      params: params.slice(0, search.trim() ? 3 : 2)
    });

    if (countError) {
      console.error('Error counting clients:', countError);
      throw countError;
    }

    const total = countData?.[0]?.total || 0;
    const totalPages = Math.ceil(total / itemsPerPage);

    // Aplicar paginação
    const offset = (page - 1) * itemsPerPage;
    query += ` LIMIT ${itemsPerPage} OFFSET ${offset}`;

    const { data: clientes, error: clientesError } = await supabase.rpc('exec_sql', {
      query,
      params
    });

    if (clientesError) {
      console.error('Error fetching clients with calculations:', clientesError);
      throw clientesError;
    }

    console.log(`Returning ${clientes?.length || 0} clients with calculations`);

    return new Response(JSON.stringify({
      clientes: clientes || [],
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-clientes-com-calculos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});