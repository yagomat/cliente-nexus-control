import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDadosCadastro } from "@/hooks/useDadosCadastro";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  uf: z.string().optional(),
  servidor: z.string().min(1, "Servidor é obrigatório"),
  dia_vencimento: z.number().min(1).max(31),
  valor_plano: z.number().optional(),
  dispositivo_smart: z.string().optional(),
  aplicativo: z.string().min(1, "Aplicativo é obrigatório"),
  usuario_aplicativo: z.string().optional(),
  senha_aplicativo: z.string().optional(),
  data_licenca_aplicativo: z.date().optional(),
  tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().optional(),
  aplicativo_2: z.string().optional(),
  usuario_aplicativo_2: z.string().optional(),
  senha_aplicativo_2: z.string().optional(),
  data_licenca_aplicativo_2: z.date().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function EditarCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { servidores, aplicativos, dispositivos, valoresPlano } = useDadosCadastro();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateOpen2, setDateOpen2] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dia_vencimento: 1,
      tela_adicional: false,
    },
  });

  useEffect(() => {
    if (id && user) {
      loadCliente();
    }
  }, [id, user]);

  const loadCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Cliente não encontrado",
          description: "O cliente não foi encontrado ou você não tem permissão para editá-lo.",
          variant: "destructive",
        });
        navigate('/clientes');
        return;
      }

      // Preencher o formulário com os dados do cliente
      form.reset({
        nome: data.nome,
        telefone: data.telefone,
        uf: data.uf || undefined,
        servidor: data.servidor,
        dia_vencimento: data.dia_vencimento,
        valor_plano: data.valor_plano || undefined,
        dispositivo_smart: data.dispositivo_smart || undefined,
        aplicativo: data.aplicativo,
        usuario_aplicativo: data.usuario_aplicativo || undefined,
        senha_aplicativo: data.senha_aplicativo || undefined,
        data_licenca_aplicativo: data.data_licenca_aplicativo ? new Date(data.data_licenca_aplicativo) : undefined,
        tela_adicional: data.tela_adicional || false,
        dispositivo_smart_2: data.dispositivo_smart_2 || undefined,
        aplicativo_2: data.aplicativo_2 || undefined,
        usuario_aplicativo_2: data.usuario_aplicativo_2 || undefined,
        senha_aplicativo_2: data.senha_aplicativo_2 || undefined,
        data_licenca_aplicativo_2: data.data_licenca_aplicativo_2 ? new Date(data.data_licenca_aplicativo_2) : undefined,
        observacoes: data.observacoes || undefined,
      });

    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      toast({
        title: "Erro ao carregar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      navigate('/clientes');
    } finally {
      setLoadingCliente(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user || !id) return;
    
    setIsLoading(true);
    try {
      const updateData = {
        nome: data.nome,
        telefone: data.telefone,
        uf: data.uf || null,
        servidor: data.servidor,
        dia_vencimento: data.dia_vencimento,
        valor_plano: data.valor_plano || null,
        dispositivo_smart: data.dispositivo_smart || null,
        aplicativo: data.aplicativo,
        usuario_aplicativo: data.usuario_aplicativo || null,
        senha_aplicativo: data.senha_aplicativo || null,
        data_licenca_aplicativo: data.data_licenca_aplicativo?.toISOString().split('T')[0] || null,
        tela_adicional: data.tela_adicional,
        dispositivo_smart_2: data.dispositivo_smart_2 || null,
        aplicativo_2: data.aplicativo_2 || null,
        usuario_aplicativo_2: data.usuario_aplicativo_2 || null,
        senha_aplicativo_2: data.senha_aplicativo_2 || null,
        data_licenca_aplicativo_2: data.data_licenca_aplicativo_2?.toISOString().split('T')[0] || null,
        observacoes: data.observacoes || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As informações do cliente foram atualizadas.",
      });

      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCliente) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="flex items-center justify-center h-32">
          <p>Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/clientes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Digite o nome do cliente"
                {...form.register("nome")}
              />
              {form.formState.errors.nome && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div>
              <Label>Código do País</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                <span className="text-lg">🇧🇷</span>
                <span>+55</span>
                <span>Brasil</span>
              </div>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                maxLength={15}
                {...form.register("telefone")}
              />
              <div className="text-sm text-muted-foreground text-right">
                {form.watch("telefone")?.length || 0}/15
              </div>
            </div>

            <div>
              <Label htmlFor="uf">UF</Label>
              <Select value={form.watch("uf") || ""} onValueChange={(value) => form.setValue("uf", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="servidor">Servidor *</Label>
              <Select value={form.watch("servidor") || ""} onValueChange={(value) => form.setValue("servidor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {servidores.map((servidor) => (
                    <SelectItem key={servidor.id} value={servidor.nome}>
                      {servidor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
              <Select 
                value={form.watch("dia_vencimento")?.toString() || "1"}
                onValueChange={(value) => form.setValue("dia_vencimento", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                    <SelectItem key={dia} value={dia.toString()}>
                      {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor_plano">Valor do Plano (R$)</Label>
              <Select 
                value={form.watch("valor_plano")?.toString() || ""}
                onValueChange={(value) => form.setValue("valor_plano", parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o valor" />
                </SelectTrigger>
                <SelectContent>
                  {valoresPlano.map((valor) => (
                    <SelectItem key={valor.id} value={valor.valor.toString()}>
                      R$ {valor.valor.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tela Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dispositivo_smart">Dispositivo Smart</Label>
              <Select 
                value={form.watch("dispositivo_smart") || ""}
                onValueChange={(value) => form.setValue("dispositivo_smart", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {dispositivos.map((dispositivo) => (
                    <SelectItem key={dispositivo.id} value={dispositivo.nome}>
                      {dispositivo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aplicativo">Aplicativo *</Label>
              <Select 
                value={form.watch("aplicativo") || ""}
                onValueChange={(value) => form.setValue("aplicativo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aplicativo" />
                </SelectTrigger>
                <SelectContent>
                  {aplicativos.map((app) => (
                    <SelectItem key={app.id} value={app.nome}>
                      {app.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="usuario_aplicativo">Usuário do Aplicativo</Label>
              <Input
                id="usuario_aplicativo"
                placeholder="Digite o usuário"
                maxLength={25}
                {...form.register("usuario_aplicativo")}
              />
              <div className="text-sm text-muted-foreground text-right">
                {form.watch("usuario_aplicativo")?.length || 0}/25
              </div>
            </div>

            <div>
              <Label htmlFor="senha_aplicativo">Senha do Aplicativo</Label>
              <Input
                id="senha_aplicativo"
                type="password"
                placeholder="Digite a senha"
                maxLength={25}
                {...form.register("senha_aplicativo")}
              />
              <div className="text-sm text-muted-foreground text-right">
                {form.watch("senha_aplicativo")?.length || 0}/25
              </div>
            </div>

            <div>
              <Label>Data de Licença do Aplicativo</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("data_licenca_aplicativo") && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {form.watch("data_licenca_aplicativo") ? (
                      format(form.watch("data_licenca_aplicativo")!, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={form.watch("data_licenca_aplicativo")}
                    onSelect={(date) => {
                      form.setValue("data_licenca_aplicativo", date);
                      setDateOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tela_adicional"
                checked={form.watch("tela_adicional")}
                onCheckedChange={(checked) => form.setValue("tela_adicional", checked)}
              />
              <Label htmlFor="tela_adicional">Acrescentar uma tela adicional</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tela Principal 2 - Exibida condicionalmente */}
        {form.watch("tela_adicional") && (
          <Card>
            <CardHeader>
              <CardTitle>Tela Principal 2</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                 <Label htmlFor="dispositivo_smart_2">Dispositivo Smart 2</Label>
                 <Select 
                   value={form.watch("dispositivo_smart_2") || ""}
                   onValueChange={(value) => form.setValue("dispositivo_smart_2", value)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione um dispositivo" />
                   </SelectTrigger>
                   <SelectContent>
                     {dispositivos.map((dispositivo) => (
                       <SelectItem key={dispositivo.id} value={dispositivo.nome}>
                         {dispositivo.nome}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div>
                 <Label htmlFor="aplicativo_2">Aplicativo 2</Label>
                 <Select 
                   value={form.watch("aplicativo_2") || ""}
                   onValueChange={(value) => form.setValue("aplicativo_2", value)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione um aplicativo" />
                   </SelectTrigger>
                   <SelectContent>
                     {aplicativos.map((app) => (
                       <SelectItem key={app.id} value={app.nome}>
                         {app.nome}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

              <div>
                <Label htmlFor="usuario_aplicativo_2">Usuário do Aplicativo 2</Label>
                <Input
                  id="usuario_aplicativo_2"
                  placeholder="Digite o usuário"
                  maxLength={25}
                  {...form.register("usuario_aplicativo_2")}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {form.watch("usuario_aplicativo_2")?.length || 0}/25
                </div>
              </div>

              <div>
                <Label htmlFor="senha_aplicativo_2">Senha do Aplicativo 2</Label>
                <Input
                  id="senha_aplicativo_2"
                  type="password"
                  placeholder="Digite a senha"
                  maxLength={25}
                  {...form.register("senha_aplicativo_2")}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {form.watch("senha_aplicativo_2")?.length || 0}/25
                </div>
              </div>

              <div>
                <Label>Data de Licença do Aplicativo 2</Label>
                <Popover open={dateOpen2} onOpenChange={setDateOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch("data_licenca_aplicativo_2") && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch("data_licenca_aplicativo_2") ? (
                        format(form.watch("data_licenca_aplicativo_2")!, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.watch("data_licenca_aplicativo_2")}
                      onSelect={(date) => {
                        form.setValue("data_licenca_aplicativo_2", date);
                        setDateOpen2(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Digite observações sobre o cliente..."
                maxLength={500}
                rows={4}
                {...form.register("observacoes")}
              />
              <div className="text-sm text-muted-foreground text-right">
                {form.watch("observacoes")?.length || 0}/500
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/clientes')}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}