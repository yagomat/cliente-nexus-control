import { Database, Plus, Search, DollarSign, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const DadosCadastro = () => {
  const [servidores, setServidores] = useState(['Servidor 1', 'Servidor 2', 'Servidor 3', 'Servidor 4', 'Servidor 5']);
  const [aplicativos, setAplicativos] = useState(['IPTV Pro', 'Smart IPTV', 'SS IPTV', 'TiviMate', 'Perfect Player']);
  const [dispositivos, setDispositivos] = useState(['TV Box', 'Smart TV', 'Celular', 'Tablet', 'PC']);
  const [valoresPlano, setValoresPlano] = useState([15.99, 25.90, 35.00, 45.50, 50.00]);
  
  const [novoServidor, setNovoServidor] = useState('');
  const [novoAplicativo, setNovoAplicativo] = useState('');
  const [novoDispositivo, setNovoDispositivo] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const adicionarItem = (tipo: string, valor: string) => {
    if (!valor.trim()) return;
    
    switch (tipo) {
      case 'servidor':
        setServidores(prev => [...prev, valor].sort());
        setNovoServidor('');
        break;
      case 'aplicativo':
        setAplicativos(prev => [...prev, valor].sort());
        setNovoAplicativo('');
        break;
      case 'dispositivo':
        setDispositivos(prev => [...prev, valor].sort());
        setNovoDispositivo('');
        break;
      case 'valor':
        const valorNumerico = parseFloat(valor);
        if (!isNaN(valorNumerico)) {
          setValoresPlano(prev => [...prev, valorNumerico].sort((a, b) => a - b));
          setNovoValor('');
        }
        break;
    }
  };

  const removerItem = (tipo: string, index: number) => {
    switch (tipo) {
      case 'servidor':
        setServidores(prev => prev.filter((_, i) => i !== index));
        break;
      case 'aplicativo':
        setAplicativos(prev => prev.filter((_, i) => i !== index));
        break;
      case 'dispositivo':
        setDispositivos(prev => prev.filter((_, i) => i !== index));
        break;
      case 'valor':
        setValoresPlano(prev => prev.filter((_, i) => i !== index));
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarItem('servidor', novoServidor)}
                  />
                  <Button 
                    onClick={() => adicionarItem('servidor', novoServidor)}
                    className="flex items-center gap-2"
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
                {servidores.map((servidor, index) => (
                  <div key={servidor} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{servidor}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerItem('servidor', index)}
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarItem('aplicativo', novoAplicativo)}
                  />
                  <Button 
                    onClick={() => adicionarItem('aplicativo', novoAplicativo)}
                    className="flex items-center gap-2"
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
                  <div key={app} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{app}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerItem('aplicativo', aplicativos.indexOf(app))}
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarItem('dispositivo', novoDispositivo)}
                  />
                  <Button 
                    onClick={() => adicionarItem('dispositivo', novoDispositivo)}
                    className="flex items-center gap-2"
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
                  <div key={dispositivo} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{dispositivo}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerItem('dispositivo', dispositivos.indexOf(dispositivo))}
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
                    onKeyPress={(e) => e.key === 'Enter' && adicionarItem('valor', novoValor)}
                    className="w-40"
                  />
                  <Button 
                    onClick={() => adicionarItem('valor', novoValor)}
                    className="flex items-center gap-2"
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
                {valoresPlano.map((valor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">R$ {valor.toFixed(2)}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removerItem('valor', index)}
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