import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'todos'
    const ordenacao = searchParams.get('ordenacao') || 'nome_asc'
    const page = parseInt(searchParams.get('page') || '1')
    const itemsPerPage = parseInt(searchParams.get('itemsPerPage') || '10')
    const ano = parseInt(searchParams.get('ano') || new Date().getFullYear().toString())

    console.log('Filtering clients:', { search, status, ordenacao, page, itemsPerPage, ano })

    // Base query
    let query = supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    // Apply search filter
    if (search) {
      query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%`)
    }

    // Get all clients first to calculate status
    const { data: allClientes, error: clientesError } = await query

    if (clientesError) {
      console.error('Error fetching clients:', clientesError)
      throw clientesError
    }

    // Get all payments for status calculation
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('user_id', user.id)

    if (pagamentosError) {
      console.error('Error fetching payments:', pagamentosError)
      throw pagamentosError
    }

    // Calculate status for each client
    const clientesComStatus = allClientes?.map(cliente => {
      const hoje = new Date()
      const mesAtual = hoje.getMonth() + 1
      const anoAtual = hoje.getFullYear()
      
      // Get current month payment
      const pagamentoAtual = pagamentos?.find(p => 
        p.cliente_id === cliente.id && 
        p.mes === mesAtual && 
        p.ano === anoAtual
      )
      
      // Get previous month payment
      const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1
      const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual
      const pagamentoAnterior = pagamentos?.find(p => 
        p.cliente_id === cliente.id && 
        p.mes === mesAnterior && 
        p.ano === anoAnterior
      )

      const ativo = pagamentoAtual?.status === 'pago' || 
                   pagamentoAtual?.status === 'promocao' ||
                   (pagamentoAnterior?.status === 'pago' || pagamentoAnterior?.status === 'promocao')

      return {
        ...cliente,
        status_calculado: ativo
      }
    }) || []

    // Apply status filter
    let clientesFiltrados = clientesComStatus
    if (status === 'ativo') {
      clientesFiltrados = clientesComStatus.filter(c => c.status_calculado)
    } else if (status === 'inativo') {
      clientesFiltrados = clientesComStatus.filter(c => !c.status_calculado)
    }

    // Apply sorting
    const [campo, direcao] = ordenacao.split('_')
    clientesFiltrados.sort((a, b) => {
      let valueA, valueB
      
      switch (campo) {
        case 'nome':
          valueA = a.nome.toLowerCase()
          valueB = b.nome.toLowerCase()
          break
        case 'vencimento':
          valueA = a.dia_vencimento
          valueB = b.dia_vencimento
          break
        case 'valor':
          valueA = a.valor_plano || 0
          valueB = b.valor_plano || 0
          break
        case 'status':
          valueA = a.status_calculado ? 1 : 0
          valueB = b.status_calculado ? 1 : 0
          break
        default:
          valueA = a.nome.toLowerCase()
          valueB = b.nome.toLowerCase()
      }

      if (direcao === 'desc') {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      } else {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      }
    })

    // Apply pagination
    const total = clientesFiltrados.length
    const totalPages = Math.ceil(total / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex)

    console.log('Filtered and paginated clients:', { total, totalPages, currentPage: page, returned: clientesPaginados.length })

    return new Response(JSON.stringify({
      clientes: clientesPaginados,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in get-clientes-filtrados:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})