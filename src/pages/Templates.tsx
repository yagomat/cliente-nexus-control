import { MessageSquare, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Templates = () => {
  const templates = [
    {
      id: 1,
      nome: "Cobrança Padrão",
      tipo: "cobranca",
      mensagem: "Olá {nome}, seu pagamento do plano IPTV está em atraso. Valor: R$ {valor}. Vencimento: {vencimento}.",
      isDefault: true
    },
    {
      id: 2,
      nome: "Renovação de Licença",
      tipo: "renovacao",
      mensagem: "Oi {nome}! Sua licença do {aplicativo} vence em breve. Entre em contato para renovar.",
      isDefault: false
    },
    {
      id: 3,
      nome: "Boas-vindas",
      tipo: "boas_vindas",
      mensagem: "Bem-vindo {nome}! Seus dados de acesso: Servidor: {servidor}, Usuário: {usuario}, Senha: {senha}.",
      isDefault: true
    },
    {
      id: 4,
      nome: "Lembrete de Vencimento",
      tipo: "lembrete",
      mensagem: "Oi {nome}, seu plano vence no dia {vencimento}. Não se esqueça de renovar!",
      isDefault: false
    }
  ];

  const getTipoBadge = (tipo: string) => {
    const types = {
      cobranca: { label: "Cobrança", variant: "destructive" as const },
      renovacao: { label: "Renovação", variant: "default" as const },
      boas_vindas: { label: "Boas-vindas", variant: "secondary" as const },
      lembrete: { label: "Lembrete", variant: "outline" as const }
    };
    return types[tipo as keyof typeof types] || { label: tipo, variant: "outline" as const };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates WhatsApp</h1>
          <p className="text-muted-foreground">Gerencie mensagens predefinidas para WhatsApp</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge {...getTipoBadge(template.tipo)}>
                        {getTipoBadge(template.tipo).label}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="outline">Padrão</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Mensagem:</h4>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{template.mensagem}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Variáveis disponíveis:</h4>
                  <div className="flex flex-wrap gap-1">
                    {['{nome}', '{valor}', '{vencimento}', '{servidor}', '{aplicativo}', '{usuario}', '{senha}'].map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar Template
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Testar Envio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Variáveis Disponíveis</CardTitle>
          <CardDescription>Use essas variáveis em seus templates para personalizar as mensagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Badge variant="secondary">{'{nome}'}</Badge>
                <span className="text-sm text-muted-foreground">Nome do cliente</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{telefone}'}</Badge>
                <span className="text-sm text-muted-foreground">Telefone do cliente</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{valor}'}</Badge>
                <span className="text-sm text-muted-foreground">Valor do plano</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{vencimento}'}</Badge>
                <span className="text-sm text-muted-foreground">Dia de vencimento</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Badge variant="secondary">{'{servidor}'}</Badge>
                <span className="text-sm text-muted-foreground">Servidor do cliente</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{aplicativo}'}</Badge>
                <span className="text-sm text-muted-foreground">Aplicativo IPTV</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{usuario}'}</Badge>
                <span className="text-sm text-muted-foreground">Usuário do aplicativo</span>
              </div>
              <div className="flex justify-between">
                <Badge variant="secondary">{'{senha}'}</Badge>
                <span className="text-sm text-muted-foreground">Senha do aplicativo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Templates;