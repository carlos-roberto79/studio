"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, UserPlus, LayoutDashboard, LogOut, Briefcase, Users, CalendarPlus, BellDot } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useAuth } from '@/contexts/AuthContext'; // Placeholder, will be created
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

const authenticatedNavLinks = (role: string | null) => [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['client', 'professional', 'company_admin'] },
  { href: '/dashboard/company', label: 'My Company', icon: <Briefcase className="h-5 w-5" />, roles: ['company_admin'] },
  { href: '/dashboard/professional', label: 'My Schedule', icon: <CalendarPlus className="h-5 w-5" />, roles: ['professional'] },
  { href: '/dashboard/client', label: 'My Appointments', icon: <Users className="h-5 w-5" />, roles: ['client'] },
  { href: '/notifications-tester', label: 'Notifications AI', icon: <BellDot className="h-5 w-5" />, roles: ['company_admin', 'professional'] }, // For testing
];

export function Navbar() {
  const pathname = usePathname();
  const { user, role, loading, logout } = useAuth(); // Placeholder values

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
            <Button variant="outline" size="sm" disabled>Loading...</Button>
          ) : user ? (
            <>
              <span className="hidden md:inline text-sm text-muted-foreground mr-2">Welcome, {user.email?.split('@')[0] || 'User'} ({role})</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" /> Sign Up</Link>
              </Button>
            </>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-10">
                <nav className="flex flex-col space-y-3">
                  {renderNavLinks(true)}
                  <Separator className="my-4"/>
                  {user && (
                    <Button variant="ghost" onClick={logout} className="w-full justify-start text-base py-3 text-destructive hover:text-destructive">
                      <LogOut className="mr-2 h-5 w-5" /> Logout
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
