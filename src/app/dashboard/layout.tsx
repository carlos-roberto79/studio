
"use client";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Briefcase, Users, CalendarPlus, Settings, LogOut, BellDot, Package } from "lucide-react"; // Adicionado Package
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const navItemsBase = [
  { href: "/dashboard", label: "Visão Geral", icon: <LayoutDashboard />, roles: ['client', 'professional', 'company_admin'] },
  { href: "/dashboard/company", label: "Config. Empresa", icon: <Briefcase />, roles: ['company_admin'] },
  { href: "/dashboard/professional", label: "Minha Agenda", icon: <CalendarPlus />, roles: ['professional'] },
  { href: "/dashboard/client", label: "Meus Agendamentos", icon: <Users />, roles: ['client'] },
  { href: "/dashboard/client/plans", label: "Ver Planos", icon: <Package />, roles: ['client'] }, // Novo item para cliente
  { href: "/notifications-tester", label: "IA de Notificações", icon: <BellDot />, roles: ['company_admin', 'professional'] }, 
  { href: "/dashboard/settings", label: "Configurações", icon: <Settings />, roles: ['client', 'professional', 'company_admin'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  const filteredNavItems = navItemsBase.filter(item => item.roles.includes(role || ''));

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <Logo className="h-7 w-7" />
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton tooltip={item.label} isActive={router.pathname === item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Separator className="my-2" />
           <Button variant="ghost" className="w-full justify-start" onClick={logout}>
             <LogOut className="mr-2 h-4 w-4" /> Sair
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
