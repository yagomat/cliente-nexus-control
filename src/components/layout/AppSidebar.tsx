import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  Users, 
  Database, 
  MessageSquare, 
  Settings 
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Dados de Cadastro", url: "/dados-cadastro", icon: Database },
  { title: "Templates", url: "/templates", icon: MessageSquare },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/clientes") {
      return currentPath.startsWith("/clientes");
    }
    return currentPath === path;
  };
  
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar 
      className={`fixed left-0 top-0 z-50 h-screen border-r ${isCollapsed ? "w-16" : "w-60"}`} 
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-lg font-bold text-primary mb-4 ${isCollapsed ? 'sr-only' : ''}`}>
            Gestor Connect
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1 h-12">
                    <NavLink 
                      to={item.url} 
                      className={getNavClass}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}