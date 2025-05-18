
"use client";

import Link from 'next/link';
import { APP_NAME, USER_ROLES } from '@/lib/constants';
import { Copyright } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const quickLinks = [
  { href: '/#features', label: 'Recursos' },
  { href: '/#pricing', label: 'Preços' },
  { href: '/contact', label: 'Fale Conosco' },
  { href: '/terms', label: 'Termos de Serviço' },
  { href: '/privacy', label: 'Política de Privacidade' },
];

export function Footer() {
  const { role } = useAuth();
  const [isCompanyProfileComplete, setIsCompanyProfileComplete] = useState(false);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyEmail, setCompanyEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure localStorage is available
      if (role === USER_ROLES.COMPANY_ADMIN) {
        const profileComplete = localStorage.getItem('tdsagenda_companyProfileComplete_mock') === 'true';
        setIsCompanyProfileComplete(profileComplete);
        if (profileComplete) {
          setCompanyName(localStorage.getItem('tdsagenda_companyName_mock'));
          setCompanyEmail(localStorage.getItem('tdsagenda_companyEmail_mock'));
        } else {
          setCompanyName(null);
          setCompanyEmail(null);
        }
      } else {
        // Para outros papéis ou usuários não logados, redefina para o padrão TDS+Agenda
        setIsCompanyProfileComplete(false);
        setCompanyName(null);
        setCompanyEmail(null);
      }
    }
  }, [role]);

  const showCompanySpecificFooter = role === USER_ROLES.COMPANY_ADMIN && isCompanyProfileComplete;

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        {showCompanySpecificFooter && companyName ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{companyName}</h3>
                {companyEmail && <p className="text-sm text-muted-foreground mt-1">Contato: {companyEmail}</p>}
              </div>
              {/* Você pode adicionar links específicos da empresa aqui se desejar */}
            </div>
            <div className="mt-8 border-t pt-8 text-center">
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <Copyright className="mr-1 h-4 w-4" /> {new Date().getFullYear()} {companyName}. Todos os direitos reservados.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-foreground">{APP_NAME}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Simplificando seus agendamentos, sem esforço.
                </p>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Links Rápidos</h4>
                  <ul className="space-y-1">
                    {quickLinks.slice(0, 3).map(link => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 opacity-0 md:opacity-100">.</h4> {/* Spacer for alignment */}
                  <ul className="space-y-1">
                    {quickLinks.slice(3).map(link => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t pt-8 text-center">
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <Copyright className="mr-1 h-4 w-4" /> {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
