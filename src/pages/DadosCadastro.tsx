import { Database, Plus, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DadosCadastro = () => {
  const ufs = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'ES', 'DF'];
  const servidores = ['Servidor 1', 'Servidor 2', 'Servidor 3', 'Servidor 4', 'Servidor 5'];
  const aplicativos = ['IPTV Pro', 'Smart IPTV', 'SS IPTV', 'TiviMate', 'Perfect Player'];
  const dispositivos = ['TV Box', 'Smart TV', 'Celular', 'Tablet', 'PC'];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dados de Cadastro</h1>
        <p className="text-muted-foreground">Gerencie valores predefinidos para cadastros</p>
      </div>

      <Tabs defaultValue="ufs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ufs">UFs</TabsTrigger>
          <TabsTrigger value="servidores">Servidores</TabsTrigger>
          <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
          <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="ufs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estados (UFs)</CardTitle>
                  <CardDescription>Lista de estados brasileiros disponíveis</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar UF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar UF..." className="pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {ufs.map((uf) => (
                  <div key={uf} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{uf}</span>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servidores">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Servidores</CardTitle>
                  <CardDescription>Lista de servidores disponíveis</CardDescription>
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Servidor
                </Button>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Excluir</Button>
                    </div>
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
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Aplicativo
                </Button>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Excluir</Button>
                    </div>
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
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Dispositivo
                </Button>
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
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      <Button variant="outline" size="sm">Excluir</Button>
                    </div>
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