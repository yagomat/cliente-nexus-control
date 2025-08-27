import { LayoutGrid, Users, TrendingUp, Calendar, DollarSign, AlertTriangle, Smartphone, Monitor, MapPin, Server, UserCheck, UserX, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDashboardOptimized } from "@/hooks/useDashboardOptimized";
import { useState } from "react";

// Cores reorganizadas para melhor contraste entre cores adjacentes
const COLORS = [
  '#EF4444',      // Vermelho
  '#10B981',      // Verde
  '#3B82F6',      // Azul
  '#F59E0B',      // Âmbar/Laranja
  '#8B5CF6',      // Violeta/Roxo
  '#06B6D4',      // Ciano
  '#F97316',      // Laranja
  '#84CC16',      // Lima/Verde claro
  '#EC4899',      // Rosa/Pink
  '#6B7280',      // Cinza
  '#14B8A6',      // Teal
  '#F43F5E'       // Rose
];

// Função para formatar exibição de dias
const formatarDias = (dias: number): string => {
  if (dias === 0) return "(Hoje)";
  if (dias === 1) return "(Amanhã)";
  return `(${dias} dias)`;
};

const Dashboard = () => {
  const { data: dashboardData, loading } = useDashboardOptimized();
  const [selectedSegments, setSelectedSegments] = useState<Record<string, string | null>>({
    dispositivo: null,
    aplicativo: null,
    uf: null,
    servidor: null
  });

  const handleSegmentClick = (chartType: string, name: string) => {
    setSelectedSegments(prev => ({
      ...prev,
      [chartType]: prev[chartType] === name ? null : name
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      
      return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-foreground">
          {label && <p className="text-sm font-medium mb-1">{`${label}`}</p>}
          <p className="text-sm">{`${data.name || 'Valor'}: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = dashboardData.distribuicaoDispositivos.reduce((sum, item) => sum + item.total, 0) || 
                   dashboardData.distribuicaoAplicativos.reduce((sum, item) => sum + item.total, 0) ||
                   dashboardData.distribuicaoUf.reduce((sum, item) => sum + item.total, 0) ||
                   dashboardData.distribuicaoServidores.reduce((sum, item) => sum + item.total, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-foreground">
          <p className="text-sm font-medium">{`${data.name}: ${percentage}%`}</p>
          <p className="text-sm">{`Total: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomClientesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-foreground">
          <p className="text-sm font-medium mb-1">{`${label}`}</p>
          <p className="text-sm">{`Clientes Ativos: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPagamentosTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-foreground">
          <p className="text-sm font-medium mb-1">{`${label}`}</p>
          <p className="text-sm">{`Valor: R$ ${payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ data, chartType }: { data: Array<{ nome: string; total: number }>, chartType: string }) => {
    const totalSum = data.reduce((sum, item) => sum + item.total, 0);
    
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {data.map((item, index) => {
          const percentage = ((item.total / totalSum) * 100).toFixed(1);
          const isSelected = selectedSegments[chartType] === item.nome;
          
          return (
            <div 
              key={item.nome}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors p-1 rounded"
              onClick={() => handleSegmentClick(chartType, item.nome)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium truncate">{item.nome}</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-sm font-bold">{item.total}</span>
                {isSelected && (
                  <span className="text-xs text-muted-foreground">({percentage}%)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards de alerta - clientes e apps vencendo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Clientes Vencendo (3 dias)</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{dashboardData.vencendoEsteMs}</div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
              {dashboardData.clientesVencendo3Dias.length > 0 ? (
                dashboardData.clientesVencendo3Dias.map((cliente, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{cliente.nome}</span>
                    <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">
                      {cliente.servidor} {formatarDias(cliente.dias)}
                    </span>
                  </div>
                ))
              ) : (
                <span>Nenhum cliente vencendo</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Apps Vencendo (30 dias)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{dashboardData.vencendoProximoMs}</div>
            <div className="text-xs text-orange-700 dark:text-orange-300 mt-2 space-y-1">
              {dashboardData.appsVencendo30Dias.length > 0 ? (
                dashboardData.appsVencendo30Dias.map((cliente, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{cliente.nome}</span>
                    <span className="text-xs bg-orange-200 dark:bg-orange-800 px-2 py-1 rounded">
                      {cliente.aplicativo} {formatarDias(cliente.dias)}
                    </span>
                  </div>
                ))
              ) : (
                <span>Nenhum cliente vencendo</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalClientes}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">Em atividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.clientesInativos}</div>
            <p className="text-xs text-muted-foreground">Desativados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes (30 dias)</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.novosClientes}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Pagamentos Esperados</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">Considera clientes que pagaram mês passado mas ainda não pagaram esse mês</p>
                </PopoverContent>
              </Popover>
            </div>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.valorEsperado}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {dashboardData.valorRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Evolução de Clientes Ativos</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">Considera o total de clientes que realizaram pagamentos em cada mês nos últimos 12 meses</p>
                </PopoverContent>
              </Popover>
            </div>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-1 md:pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.evolucaoClientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomClientesTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Evolução de Pagamentos</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">Considera o total de pagamentos recebidos em cada mês nos últimos 12 meses</p>
                </PopoverContent>
              </Popover>
            </div>
            <CardDescription>Últimos 12 meses (R$)</CardDescription>
          </CardHeader>
          <CardContent className="pl-1 md:pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.evolucaoPagamentos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip content={<CustomPagamentosTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle>Distribuição por Dispositivo</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">Considera os dispositivos nas 2 telas apenas dos clientes ativos</p>
                </PopoverContent>
              </Popover>
            </div>
            <CardDescription>Dispositivos Smart (Telas 1 e 2)</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoDispositivos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ total }) => total}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {dashboardData.distribuicaoDispositivos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoDispositivos} chartType="dispositivo" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle>Distribuição por Aplicativo</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">Considera os aplicativos nas 2 telas apenas dos clientes ativos</p>
                </PopoverContent>
              </Popover>
            </div>
            <CardDescription>Apps mais utilizados (Telas 1 e 2)</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoAplicativos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ total }) => total}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {dashboardData.distribuicaoAplicativos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoAplicativos} chartType="aplicativo" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Distribuição por UF</CardTitle>
            <CardDescription>Estados dos clientes</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoUf}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ total }) => total}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {dashboardData.distribuicaoUf.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoUf} chartType="uf" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Distribuição por Servidor</CardTitle>
            <CardDescription>Servidores utilizados</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoServidores}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ total }) => total}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {dashboardData.distribuicaoServidores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoServidores} chartType="servidor" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
