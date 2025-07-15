import { useState } from "react";
import { Save, User, Bell, Lock, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Configuracoes = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: user?.user_metadata?.nome || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          nome: formData.nome,
        },
        email: formData.email,
      });

      if (error) {
        toast.error("Erro ao atualizar os dados: " + error.message);
      } else {
        toast.success("Dados atualizados com sucesso!");
      }
    } catch (error: any) {
      toast.error("Erro ao atualizar os dados: " + error.message);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Tabs defaultValue="perfil" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Lock className="mr-2 h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="aparencia">
            <Palette className="mr-2 h-4 w-4" />
            Aparência
          </TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">
                  Notificações por Email
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">
                  Notificações Push
                </Label>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Opções de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Alterar Senha</Label>
                <Input id="password" type="password" />
              </div>
              <Button>Alterar Senha</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;
