
"use client";

import Link from 'next/link';
import { APP_NAME, USER_ROLES } from '@/lib/constants';
import { Copyright } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getCompanyDetailsByOwner, type CompanyData } from '@/services/supabaseService'; // Importar

const quickLinks = [
  { href: '/#features', label: 'Recursos' },
  { href: '/#pricing', label: 'Preços' },
  { href: '/contact', label: 'Fale Conosco' },
  { href: '/terms', label: 'Termos de Serviço' },
  { href: '/privacy', label: 'Política de Privacidade' },
];

export function Footer() {
  const { user, role, loading: authLoading } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompanyData, setIsLoadingCompanyData] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      setIsLoadingCompanyData(true);
      getCompanyDetailsByOwner(user.id)
        .then(data => {
          setCompanyData(data);
        })
        .catch(error => {
          console.error("Footer: Erro ao buscar dados da empresa:", error);
          // Não precisa de toast aqui, apenas não mostra dados da empresa
        })
        .finally(() => {
          setIsLoadingCompanyData(false);
        });
    } else {
      setCompanyData(null); // Limpa se não for admin ou não estiver logado
      setIsLoadingCompanyData(false);
    }
  }, [user, role, authLoading]);

  const showCompanySpecificFooter = role === USER_ROLES.COMPANY_ADMIN && companyData && companyData.profile_complete;

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        {showCompanySpecificFooter && companyData ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{companyData.company_name}</h3>
                {companyData.email && <p className="text-sm text-muted-foreground mt-1">Contato: {companyData.email}</p>}
              </div>
              {/* Você pode adicionar links específicos da empresa aqui se desejar */}
            </div>
            <div className="mt-8 border-t pt-8 text-center">
              <p className="flex items-center justify-center text-sm text-muted-foreground">
                <Copyright className="mr-1 h-4 w-4" /> {new Date().getFullYear()} {companyData.company_name}. Todos os direitos reservados.
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
