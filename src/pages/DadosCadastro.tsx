import { useState } from "react";
import { Plus, Building2, Users, Server, Smartphone, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDadosCadastro } from "@/hooks/useDadosCadastro";
import { toast } from "sonner";
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
    removerValorPlano
  } = useDadosCadastro();
  const [novoServidor, setNovoServidor] = useState("");
  const [novoAplicativo, setNovoAplicativo] = useState("");
  const [novoDispositivo, setNovoDispositivo] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const handleAdicionarServidor = async () => {
    if (!novoServidor.trim()) {
      toast.error("Por favor, insira um nome para o servidor.");
      return;
    }
    await adicionarServidor(novoServidor);
    setNovoServidor("");
  };
  const handleAdicionarAplicativo = async () => {
    if (!novoAplicativo.trim()) {
      toast.error("Por favor, insira um nome para o aplicativo.");
      return;
    }
    await adicionarAplicativo(novoAplicativo);
    setNovoAplicativo("");
  };
  const handleAdicionarDispositivo = async () => {
    if (!novoDispositivo.trim()) {
      toast.error("Por favor, insira um nome para o dispositivo.");
      return;
    }
    await adicionarDispositivo(novoDispositivo);
    setNovoDispositivo("");
  };
  const handleAdicionarValor = async () => {
    const valor = parseFloat(novoValor);
    if (isNaN(valor) || valor <= 0 || valor > 1000) {
      toast.error("Por favor, insira um valor entre 0 e 1000.");
      return;
    }
    await adicionarValorPlano(valor);
    setNovoValor("");
  };
  if (loading) {
    return <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p>Carregando dados...</p>
        </div>
      </div>;
  }
  return <div className="container mx-auto p-4 py-0 px-0">
      <Tabs defaultValue="servidores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servidores">
            <Server className="mr-2 h-4 w-4" />
            Servidores
          </TabsTrigger>
          <TabsTrigger value="aplicativos">
            <Smartphone className="mr-2 h-4 w-4" />
            Aplicativos
          </TabsTrigger>
          <TabsTrigger value="dispositivos">
            <Building2 className="mr-2 h-4 w-4" />
            Dispositivos
          </TabsTrigger>
          <TabsTrigger value="valores">
            <Users className="mr-2 h-4 w-4" />
            Valores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servidores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Servidores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome do servidor" value={novoServidor} onChange={e => setNovoServidor(e.target.value)} maxLength={25} />
                <Button onClick={handleAdicionarServidor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {servidores.map(servidor => <div key={servidor.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{servidor.nome}</span>
                    <Button variant="destructive" size="sm" onClick={() => removerServidor(servidor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aplicativos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Aplicativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome do aplicativo" value={novoAplicativo} onChange={e => setNovoAplicativo(e.target.value)} maxLength={25} />
                <Button onClick={handleAdicionarAplicativo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {aplicativos.map(aplicativo => <div key={aplicativo.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{aplicativo.nome}</span>
                    <Button variant="destructive" size="sm" onClick={() => removerAplicativo(aplicativo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispositivos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Dispositivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nome do dispositivo" value={novoDispositivo} onChange={e => setNovoDispositivo(e.target.value)} maxLength={25} />
                <Button onClick={handleAdicionarDispositivo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {dispositivos.map(dispositivo => <div key={dispositivo.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{dispositivo.nome}</span>
                    <Button variant="destructive" size="sm" onClick={() => removerDispositivo(dispositivo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Valores dos Planos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input type="number" placeholder="Valor do plano" value={novoValor} onChange={e => setNovoValor(e.target.value)} min="0" max="1000" step="0.01" />
                <Button onClick={handleAdicionarValor}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {valoresPlano.map(valor => <div key={valor.id} className="flex items-center justify-between p-2 border rounded">
                    <span>R$ {valor.valor.toFixed(2)}</span>
                    <Button variant="destructive" size="sm" onClick={() => removerValorPlano(valor.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default DadosCadastro;