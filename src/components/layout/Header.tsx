

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/clientes":
        return "Clientes";
      case "/clientes/novo":
        return "Novo Cliente";
      case "/dados-cadastro":
        return "Dados de Cadastro";
      case "/templates":
        return "Templates";
      case "/configuracoes":
        return "Configurações";
      default:
        if (location.pathname.includes("/clientes/")) {
          return "Editar Cliente";
        }
        return "Sistema de Gestão";
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Menu do usuário</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

