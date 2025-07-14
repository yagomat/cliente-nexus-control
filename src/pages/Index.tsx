import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Users, Database, MessageSquare, Settings, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gestor Connect
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Sistema completo de gestão de clientes IPTV com controle de pagamentos, templates WhatsApp e muito mais.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-lg px-8 py-6">
              Acessar Sistema
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Dashboard Completo</CardTitle>
              <CardDescription>
                Visão geral com estatísticas, gráficos e alertas em tempo real
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>
                Cadastro completo com controle de pagamentos e matriz visual
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Templates WhatsApp</CardTitle>
              <CardDescription>
                Mensagens personalizadas com variáveis dinâmicas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Banco de Dados</CardTitle>
              <CardDescription>
                Gerencie UFs, servidores, aplicativos e dispositivos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Personalize o sistema de acordo com suas necessidades
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>E muito mais...</CardTitle>
              <CardDescription>
                Relatórios, auditoria, backup e funcionalidades avançadas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Pronto para começar a gerenciar seus clientes de forma profissional?
          </p>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Entrar no Sistema
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
