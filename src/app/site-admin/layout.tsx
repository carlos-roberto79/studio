
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
import { LayoutDashboard, Briefcase, Palette, Settings, LogOut, ShieldAlert, Users, BarChartBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { href: "/site-admin", label: "Visão Geral", icon: <LayoutDashboard /> },
  { href: "/site-admin/companies", label: "Gerenciar Empresas", icon: <Briefcase /> },
  { href: "/site-admin/customization", label: "Personalização", icon: <Palette /> },
  { href: "/site-admin/reports/customization-usage", label: "Uso e Personalização", icon: <BarChartBig /> },
  // { href: "/dashboard/settings", label: "Configurações Gerais", icon: <Settings /> }, // Site Admin settings might be different or not needed here
];

export default function SiteAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== USER_ROLES.SITE_ADMIN)) {
      router.push("/login"); // Redirect if not site admin or not logged in
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== USER_ROLES.SITE_ADMIN) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <p className="text-muted-foreground">Verificando acesso de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <Logo className="h-7 w-7" />
            <SidebarTrigger className="md:hidden" />
          </div>
           <div className="mt-2 text-center text-sm font-semibold text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
             Painel Super Admin
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
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
