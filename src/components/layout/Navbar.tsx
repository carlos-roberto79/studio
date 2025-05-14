"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, UserPlus, LayoutDashboard, LogOut, Briefcase, Users, CalendarPlus, BellDot, Settings } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/contexts/AuthContext'; 
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/#features', label: 'Recursos' },
  { href: '/#pricing', label: 'Preços' },
  { href: '/contact', label: 'Contato' }, // Assuming a contact page might exist or be added
];

const authenticatedNavLinks = (role: string | null) => [
  { href: '/dashboard', label: 'Painel', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['client', 'professional', 'company_admin'] },
  { href: '/dashboard/company', label: 'Minha Empresa', icon: <Briefcase className="h-5 w-5" />, roles: ['company_admin'] },
  { href: '/dashboard/professional', label: 'Minha Agenda', icon: <CalendarPlus className="h-5 w-5" />, roles: ['professional'] },
  { href: '/dashboard/client', label: 'Meus Agendamentos', icon: <Users className="h-5 w-5" />, roles: ['client'] },
  { href: '/notifications-tester', label: 'IA de Notificações', icon: <BellDot className="h-5 w-5" />, roles: ['company_admin', 'professional'] },
  { href: "/dashboard/settings", label: "Configurações", icon: <Settings className="h-5 w-5" />, roles: ['client', 'professional', 'company_admin'] },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, role, loading, logout } = useAuth(); 

  const renderNavLinks = (isMobile = false) => {
    const linksToRender = user ? authenticatedNavLinks(role).filter(link => link.roles.includes(role || '')) : navLinks;
    return linksToRender.map((link) => (
      <Button
        key={link.href}
        variant="ghost"
        asChild
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === link.href ? "text-primary" : "text-muted-foreground",
          isMobile && "w-full justify-start text-base py-3"
        )}
      >
        <Link href={link.href}>
          {link.icon && <span className="mr-2">{link.icon}</span>}
          {link.label}
        </Link>
      </Button>
    ));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center space-x-2 md:flex">
          {renderNavLinks()}
        </nav>
        <div className="flex items-center space-x-2">
          {loading ? (
            <Button variant="outline" size="sm" disabled>Carregando...</Button>
          ) : user ? (
            <>
              <span className="hidden md:inline text-sm text-muted-foreground mr-2">Olá, {user.email?.split('@')[0] || 'Usuário'} ({role})</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Cadastrar</Link>
              </Button>
            </>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Alternar menu de navegação</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-10">
                <nav className="flex flex-col space-y-3">
                  {renderNavLinks(true)}
                  <Separator className="my-4"/>
                  {user && (
                    <Button variant="ghost" onClick={logout} className="w-full justify-start text-base py-3 text-destructive hover:text-destructive">
                      <LogOut className="mr-2 h-5 w-5" /> Sair
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

// Helper cn function
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
