
import { LayoutGrid, Users, TrendingUp, Calendar, DollarSign, AlertTriangle, Smartphone, Monitor, MapPin, Server, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useDashboard } from "@/hooks/useDashboard";
import { useState } from "react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899'];

const Dashboard = () => {
  const { dashboardData, loading } = useDashboard();
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
      const total = dashboardData.distribuicaoDispositivo.reduce((sum, item) => sum + item.value, 0) || 
                   dashboardData.distribuicaoAplicativo.reduce((sum, item) => sum + item.value, 0) ||
                   dashboardData.distribuicaoUF.reduce((sum, item) => sum + item.value, 0) ||
                   dashboardData.distribuicaoServidor.reduce((sum, item) => sum + item.value, 0);
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

  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-foreground">
          <p className="text-sm font-medium mb-1">{`${label}`}</p>
          <p className="text-sm">{`Valor: ${payload[0].name === 'value' && payload[0].payload.value ? `R$ ${payload[0].value}` : payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ data, chartType }: { data: Array<{ name: string; value: number }>, chartType: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const isSelected = selectedSegments[chartType] === item.name;
          
          return (
            <div 
              key={item.name}
              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors p-1 rounded"
              onClick={() => handleSegmentClick(chartType, item.name)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-sm font-bold">{item.value}</span>
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
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{dashboardData.clientesVencendo.length}</div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
              {dashboardData.clientesVencendo.length > 0 ? (
                dashboardData.clientesVencendo.slice(0, 3).map((cliente, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{cliente.nome}</span> - {cliente.servidor} 
                    <span className="text-yellow-600 dark:text-yellow-400"> ({cliente.dias} dias)</span>
                  </div>
                ))
              ) : (
                <span>Nenhum cliente vencendo</span>
              )}
              {dashboardData.clientesVencendo.length > 3 && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  +{dashboardData.clientesVencendo.length - 3} outros...
                </div>
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
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{dashboardData.appsVencendo.length}</div>
            <div className="text-xs text-orange-700 dark:text-orange-300 mt-2 space-y-1">
              {dashboardData.appsVencendo.length > 0 ? (
                dashboardData.appsVencendo.slice(0, 3).map((app, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{app.nome}</span> - {app.aplicativo} 
                    <span className="text-orange-600 dark:text-orange-400"> ({app.dias} dias)</span>
                  </div>
                ))
              ) : (
                <span>Nenhum app vencendo</span>
              )}
              {dashboardData.appsVencendo.length > 3 && (
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  +{dashboardData.appsVencendo.length - 3} outros...
                </div>
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
            <div className="text-2xl font-bold">{dashboardData.clientesNovos}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.pagamentosPendentes}</div>
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
            <CardTitle>Evolução de Clientes Ativos</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-1 md:pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.evolucaoClientes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
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
            <CardTitle>Evolução de Pagamentos</CardTitle>
            <CardDescription>Últimos 12 meses (R$)</CardDescription>
          </CardHeader>
          <CardContent className="pl-1 md:pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.evolucaoPagamentos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomLineTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
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
            <CardTitle>Distribuição por Dispositivo</CardTitle>
            <CardDescription>Dispositivos Smart (Telas 1 e 2)</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoDispositivo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.distribuicaoDispositivo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoDispositivo} chartType="dispositivo" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Distribuição por Aplicativo</CardTitle>
            <CardDescription>Apps mais utilizados (Telas 1 e 2)</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.distribuicaoAplicativo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.distribuicaoAplicativo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoAplicativo} chartType="aplicativo" />
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
                  data={dashboardData.distribuicaoUF}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.distribuicaoUF.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoUF} chartType="uf" />
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
                  data={dashboardData.distribuicaoServidor}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.distribuicaoServidor.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <CustomLegend data={dashboardData.distribuicaoServidor} chartType="servidor" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
