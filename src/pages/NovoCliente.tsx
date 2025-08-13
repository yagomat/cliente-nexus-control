import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useClienteImportExport } from "@/hooks/useClienteImportExport";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(40, "Nome deve ter no máximo 40 caracteres"),
  telefone: z.string().optional(),
  codigo_pais: z.string().max(3, "Código deve ter no máximo 3 dígitos").regex(/^\d*$/, "Apenas números são permitidos").optional(),
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
  observacoes: z.string().max(150, "Observações devem ter no máximo 150 caracteres").optional()
});

type FormData = z.infer<typeof formSchema>;

const estados = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function NovoCliente() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { servidores, aplicativos, dispositivos, valoresPlano, loading: dadosLoading } = useDadosCadastro();
  const { padronizarDadosCliente } = useClienteImportExport();
  const [isLoading, setIsLoading] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateOpen2, setDateOpen2] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dia_vencimento: 1,
      tela_adicional: false,
      codigo_pais: "55"
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const rawData = {
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
        user_id: user.id
      };

      // Aplicar padronização antes de inserir
      const insertData = padronizarDadosCliente(rawData);

      const { error } = await supabase
        .from('clientes')
        .insert([insertData]);

      if (error) throw error;

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "O cliente foi adicionado à sua lista."
      });

      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl px-0 py-0">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
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
                maxLength={40} 
                showCharacterCount 
                {...form.register("nome")} 
              />
              <div className="flex justify-between items-center mt-1">
                {form.formState.errors.nome && <p className="text-sm text-destructive">
                    {form.formState.errors.nome.message}
                  </p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="uf">UF</Label>
                <Select onValueChange={value => form.setValue("uf", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(estado => <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="codigo_pais">Código do País *</Label>
                <Input 
                  id="codigo_pais" 
                  placeholder="55" 
                  maxLength={3} 
                  showCharacterCount 
                  {...form.register("codigo_pais")} 
                />
                {form.formState.errors.codigo_pais && <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.codigo_pais.message}
                  </p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="(00) 00000-0000" 
                  maxLength={11} 
                  showCharacterCount 
                  {...form.register("telefone")} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="servidor">Servidor *</Label>
              <Select onValueChange={value => form.setValue("servidor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um servidor" />
                </SelectTrigger>
                <SelectContent>
                  {servidores.map(servidor => <SelectItem key={servidor.id} value={servidor.nome}>
                      {servidor.nome}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.servidor && <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.servidor.message}
                </p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                <Select onValueChange={value => form.setValue("dia_vencimento", parseInt(value))} defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({
                    length: 31
                  }, (_, i) => i + 1).map(dia => <SelectItem key={dia} value={dia.toString()}>
                        {dia}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor_plano">Valor do Plano (R$)</Label>
                <Select onValueChange={value => form.setValue("valor_plano", parseFloat(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o valor" />
                  </SelectTrigger>
                  <SelectContent>
                    {valoresPlano.map(valor => <SelectItem key={valor.id} value={valor.valor.toString()}>
                        R$ {valor.valor.toFixed(2)}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tela Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dispositivo_smart">Dispositivo Smart</Label>
                <Select onValueChange={value => form.setValue("dispositivo_smart", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {dispositivos.map(dispositivo => <SelectItem key={dispositivo.id} value={dispositivo.nome}>
                        {dispositivo.nome}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aplicativo">Aplicativo *</Label>
                <Select onValueChange={value => form.setValue("aplicativo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aplicativo" />
                  </SelectTrigger>
                  <SelectContent>
                    {aplicativos.map(app => <SelectItem key={app.id} value={app.nome}>
                        {app.nome}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                {form.formState.errors.aplicativo && <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.aplicativo.message}
                  </p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usuario_aplicativo">Usuário do Aplicativo</Label>
                <Input 
                  id="usuario_aplicativo" 
                  placeholder="Digite o usuário" 
                  maxLength={25} 
                  showCharacterCount 
                  {...form.register("usuario_aplicativo")} 
                />
              </div>

              <div>
                <Label htmlFor="senha_aplicativo">Senha do Aplicativo</Label>
                <Input 
                  id="senha_aplicativo" 
                  type="text" 
                  placeholder="Digite a senha" 
                  maxLength={25} 
                  showCharacterCount 
                  {...form.register("senha_aplicativo")} 
                />
              </div>
            </div>

            <div>
              <Label>Data de Licença do Aplicativo</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("data_licenca_aplicativo") && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {form.watch("data_licenca_aplicativo") ? format(form.watch("data_licenca_aplicativo")!, "PPP", {
                    locale: ptBR
                  }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={form.watch("data_licenca_aplicativo")} onSelect={date => {
                  form.setValue("data_licenca_aplicativo", date);
                  setDateOpen(false);
                }} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="tela_adicional" checked={form.watch("tela_adicional")} onCheckedChange={checked => form.setValue("tela_adicional", checked)} />
              <Label htmlFor="tela_adicional">Acrescentar uma tela adicional</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tela Principal 2 - Exibida condicionalmente */}
        {form.watch("tela_adicional") && <Card>
            <CardHeader>
              <CardTitle>Tela Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dispositivo_smart_2">Dispositivo Smart 2</Label>
                  <Select onValueChange={value => form.setValue("dispositivo_smart_2", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um dispositivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {dispositivos.map(dispositivo => <SelectItem key={dispositivo.id} value={dispositivo.nome}>
                          {dispositivo.nome}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="aplicativo_2">Aplicativo 2</Label>
                  <Select onValueChange={value => form.setValue("aplicativo_2", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aplicativo" />
                    </SelectTrigger>
                    <SelectContent>
                      {aplicativos.map(app => <SelectItem key={app.id} value={app.nome}>
                          {app.nome}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usuario_aplicativo_2">Usuário do Aplicativo 2</Label>
                  <Input 
                    id="usuario_aplicativo_2" 
                    placeholder="Digite o usuário" 
                    maxLength={25} 
                    showCharacterCount 
                    {...form.register("usuario_aplicativo_2")} 
                  />
                </div>

                <div>
                  <Label htmlFor="senha_aplicativo_2">Senha do Aplicativo 2</Label>
                  <Input 
                    id="senha_aplicativo_2" 
                    type="text" 
                    placeholder="Digite a senha" 
                    maxLength={25} 
                    showCharacterCount 
                    {...form.register("senha_aplicativo_2")} 
                  />
                </div>
              </div>

              <div>
                <Label>Data de Licença do Aplicativo 2</Label>
                <Popover open={dateOpen2} onOpenChange={setDateOpen2}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("data_licenca_aplicativo_2") && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {form.watch("data_licenca_aplicativo_2") ? format(form.watch("data_licenca_aplicativo_2")!, "PPP", {
                    locale: ptBR
                  }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={form.watch("data_licenca_aplicativo_2")} onSelect={date => {
                  form.setValue("data_licenca_aplicativo_2", date);
                  setDateOpen2(false);
                }} initialFocus className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>}

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações sobre o cliente" 
                maxLength={150} 
                showCharacterCount 
                rows={4} 
                {...form.register("observacoes")} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/clientes')} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Salvando..." : "Salvar Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
