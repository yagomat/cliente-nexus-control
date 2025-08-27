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

    console.log('Calculating dashboard metrics for user:', user.id)

    // Get all clients
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (clientesError) {
      console.error('Error fetching clients:', clientesError)
      throw clientesError
    }

    // Get all payments
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('user_id', user.id)

    if (pagamentosError) {
      console.error('Error fetching payments:', pagamentosError)
      throw pagamentosError
    }

    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()

    // Calculate metrics
    const totalClientes = clientes?.length || 0
    
    // Calculate active clients
    let clientesAtivos = 0
    let clientesInativos = 0
    let vencendoEsteMs = 0
    let vencendoProximoMs = 0
    let valorRecebido = 0
    let valorEsperado = 0

    const distribuicaoDispositivos: Record<string, number> = {}
    const distribuicaoAplicativos: Record<string, number> = {}
    const distribuicaoUf: Record<string, number> = {}
    const distribuicaoServidores: Record<string, number> = {}
    
    // Arrays to store detailed expiring clients
    const clientesVencendo3Dias: Array<{nome: string, servidor: string, dias: number}> = []
    const appsVencendo30Dias: Array<{nome: string, aplicativo: string, dias: number}> = []

    clientes?.forEach(cliente => {
      // Check if client is active
      const pagamentoAtual = pagamentos?.find(p => 
        p.cliente_id === cliente.id && 
        p.mes === mesAtual && 
        p.ano === anoAtual
      )
      
      const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1
      const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual
      const pagamentoAnterior = pagamentos?.find(p => 
        p.cliente_id === cliente.id && 
        p.mes === mesAnterior && 
        p.ano === anoAnterior
      )

      // Cliente só é ativo se tem pagamento atual pago/promoção OU 
      // tem pagamento anterior pago/promoção E ainda não passou do vencimento
      const ativo = (pagamentoAtual?.status === 'pago' || pagamentoAtual?.status === 'promocao') ||
                   (pagamentoAnterior?.status === 'pago' || pagamentoAnterior?.status === 'promocao' && 
                    hoje <= new Date(anoAtual, mesAtual - 1, cliente.dia_vencimento))

      if (ativo) {
        clientesAtivos++
        
        // Calculate when client will become inactive (current month due date)
        const dataVencimentoAtual = new Date(anoAtual, mesAtual - 1, cliente.dia_vencimento)
        const diasParaVencimento = Math.ceil((dataVencimentoAtual.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        
        // Clients becoming inactive in next 3 days (current month not paid)
        if (!pagamentoAtual && diasParaVencimento >= 0 && diasParaVencimento <= 3) {
          vencendoEsteMs++
          clientesVencendo3Dias.push({
            nome: cliente.nome || 'Cliente sem nome',
            servidor: cliente.servidor || 'Servidor não informado',
            dias: diasParaVencimento
          })
        }
        
        // Calculate next month due date for app expiry
        const proximoMes = mesAtual === 12 ? 1 : mesAtual + 1
        const proximoAno = mesAtual === 12 ? anoAtual + 1 : anoAtual
        const proximaDataVencimento = new Date(proximoAno, proximoMes - 1, cliente.dia_vencimento)
        const diasParaProximoVencimento = Math.ceil((proximaDataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        
        // Check if client already paid next month
        const pagamentoProximoMes = pagamentos?.find(p => 
          p.cliente_id === cliente.id && 
          p.mes === proximoMes && 
          p.ano === proximoAno
        )
        
        // Apps expiring in next 30 days (next month not paid)
        if (!pagamentoProximoMes && diasParaProximoVencimento >= 0 && diasParaProximoVencimento <= 30) {
          vencendoProximoMs++
          appsVencendo30Dias.push({
            nome: cliente.nome || 'Cliente sem nome',
            aplicativo: cliente.aplicativo || 'App não informado',
            dias: diasParaProximoVencimento
          })
        }

        // Calculate revenue
        if (pagamentoAtual?.status === 'pago') {
          valorRecebido += cliente.valor_plano || 0
        }
        
        valorEsperado += cliente.valor_plano || 0

        // Distributions for active clients only
        if (cliente.dispositivo_smart) {
          distribuicaoDispositivos[cliente.dispositivo_smart] = (distribuicaoDispositivos[cliente.dispositivo_smart] || 0) + 1
        }
        
        if (cliente.aplicativo) {
          distribuicaoAplicativos[cliente.aplicativo] = (distribuicaoAplicativos[cliente.aplicativo] || 0) + 1
        }
        
        if (cliente.uf) {
          distribuicaoUf[cliente.uf] = (distribuicaoUf[cliente.uf] || 0) + 1
        }
        
        if (cliente.servidor) {
          distribuicaoServidores[cliente.servidor] = (distribuicaoServidores[cliente.servidor] || 0) + 1
        }
      } else {
        clientesInativos++
      }
    })

    // Calculate evolution (last 12 months)
    const evolucaoClientes = []
    const evolucaoPagamentos = []
    
    for (let i = 11; i >= 0; i--) {
      const data = new Date(anoAtual, mesAtual - 1 - i, 1)
      const mes = data.getMonth() + 1
      const ano = data.getFullYear()
      
      // Count clients created up to this month
      const clientesAteEsteMs = clientes?.filter(c => 
        new Date(c.created_at) <= new Date(ano, mes - 1, 31)
      ).length || 0
      
      // Count payments this month
      const pagamentosDoMs = pagamentos?.filter(p => 
        p.mes === mes && p.ano === ano && (p.status === 'pago' || p.status === 'promocao')
      ).length || 0
      
      evolucaoClientes.push({
        mes: `${String(mes).padStart(2, '0')}/${ano}`,
        total: clientesAteEsteMs
      })
      
      evolucaoPagamentos.push({
        mes: `${String(mes).padStart(2, '0')}/${ano}`,
        total: pagamentosDoMs
      })
    }

    const dashboardData = {
      totalClientes,
      clientesAtivos,
      clientesInativos,
      novosClientes: clientes?.filter(c => {
        const created = new Date(c.created_at)
        const inicioMes = new Date(anoAtual, mesAtual - 1, 1)
        const fimMes = new Date(anoAtual, mesAtual, 0)
        return created >= inicioMes && created <= fimMes
      }).length || 0,
      vencendoEsteMs,
      vencendoProximoMs,
      clientesVencendo3Dias,
      appsVencendo30Dias,
      valorRecebido,
      valorEsperado,
      evolucaoClientes,
      evolucaoPagamentos,
      distribuicaoDispositivos: Object.entries(distribuicaoDispositivos).map(([nome, total]) => ({ nome, total })),
      distribuicaoAplicativos: Object.entries(distribuicaoAplicativos).map(([nome, total]) => ({ nome, total })),
      distribuicaoUf: Object.entries(distribuicaoUf).map(([nome, total]) => ({ nome, total })),
      distribuicaoServidores: Object.entries(distribuicaoServidores).map(([nome, total]) => ({ nome, total }))
    }

    console.log('Dashboard metrics calculated:', {
      totalClientes: dashboardData.totalClientes,
      clientesAtivos: dashboardData.clientesAtivos,
      clientesInativos: dashboardData.clientesInativos
    })

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in get-dashboard-clientes:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})