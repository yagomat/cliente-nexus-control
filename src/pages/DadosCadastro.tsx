import { Database, Plus, Search, DollarSign, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useDadosCadastro } from "@/hooks/useDadosCadastro";

const DadosCadastro = () => {
  const {
    servidores,
    aplicativos,
    dispositivos,
    valoresPlano,
    loading,
    adicionarServidor,
    removerServidor,
    adicionarAplicativo,
    removerAplicativo,
    adicionarDispositivo,
    removerDispositivo,
    adicionarValorPlano,
    removerValorPlano,
  } = useDadosCadastro();
  
  const [novoServidor, setNovoServidor] = useState('');
  const [novoAplicativo, setNovoAplicativo] = useState('');
  const [novoDispositivo, setNovoDispositivo] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const handleAdicionarItem = async (tipo: string, valor: string) => {
    if (!valor.trim()) return;
    
    switch (tipo) {
      case 'servidor':
        await adicionarServidor(valor);
        setNovoServidor('');
        break;
      case 'aplicativo':
        await adicionarAplicativo(valor);
        setNovoAplicativo('');
        break;
      case 'dispositivo':
        await adicionarDispositivo(valor);
        setNovoDispositivo('');
        break;
      case 'valor':
        const valorNumerico = parseFloat(valor);
        if (!isNaN(valorNumerico)) {
          await adicionarValorPlano(valorNumerico);
          setNovoValor('');
        }
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dados de Cadastro</h1>
        <p className="text-muted-foreground">Gerencie valores predefinidos para cadastros</p>
      </div>

      <Tabs defaultValue="servidores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servidores">Servidores</TabsTrigger>
          <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
          <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
          <TabsTrigger value="valores">Valores do Plano</TabsTrigger>
        </TabsList>


        <TabsContent value="servidores">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Servidores</CardTitle>
                  <CardDescription>Lista de servidores disponíveis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do servidor"
                    value={novoServidor}
                    onChange={(e) => setNovoServidor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarItem('servidor', novoServidor)}
                  />
                  <Button 
                    onClick={() => handleAdicionarItem('servidor', novoServidor)}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar servidor..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-3">
                {servidores.map((servidor) => (
                  <div key={servidor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{servidor.nome}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerServidor(servidor.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aplicativos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aplicativos</CardTitle>
                  <CardDescription>Lista de aplicativos IPTV disponíveis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do aplicativo"
                    value={novoAplicativo}
                    onChange={(e) => setNovoAplicativo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarItem('aplicativo', novoAplicativo)}
                  />
                  <Button 
                    onClick={() => handleAdicionarItem('aplicativo', novoAplicativo)}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar aplicativo..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-3">
                {aplicativos.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{app.nome}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerAplicativo(app.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispositivos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dispositivos</CardTitle>
                  <CardDescription>Lista de dispositivos compatíveis</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do dispositivo"
                    value={novoDispositivo}
                    onChange={(e) => setNovoDispositivo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarItem('dispositivo', novoDispositivo)}
                  />
                  <Button 
                    onClick={() => handleAdicionarItem('dispositivo', novoDispositivo)}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar dispositivo..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-3">
                {dispositivos.map((dispositivo) => (
                  <div key={dispositivo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{dispositivo.nome}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerDispositivo(dispositivo.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valores">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Valores do Plano</CardTitle>
                  <CardDescription>Lista de valores predefinidos para planos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Valor (ex: 29.90)"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarItem('valor', novoValor)}
                    className="w-40"
                  />
                  <Button 
                    onClick={() => handleAdicionarItem('valor', novoValor)}
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar valor..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-3">
                {valoresPlano.map((valor) => (
                  <div key={valor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">R$ {valor.valor.toFixed(2)}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerValorPlano(valor.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DadosCadastro;