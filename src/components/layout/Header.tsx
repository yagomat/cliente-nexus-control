
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPageTitle = (pathname: string) => {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/clientes': 'Clientes',
    '/dados-cadastro': 'Dados de Cadastro',
    '/templates': 'Templates',
    '/configuracoes': 'Configurações',
  };
  
  if (pathname.startsWith('/clientes/novo')) return 'Novo Cliente';
  if (pathname.startsWith('/clientes/editar')) return 'Editar Cliente';
  
  return routes[pathname] || 'Dashboard';
};

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-accent hover:text-accent-foreground">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                {user?.email || 'Usuário'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
