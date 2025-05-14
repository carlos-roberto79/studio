import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Copyright } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{APP_NAME}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Simplificando seus agendamentos, sem esforço.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-foreground">Links Rápidos</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Recursos</Link></li>
              <li><Link href="/#pricing" className="text-sm text-muted-foreground hover:text-primary">Preços</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Fale Conosco</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Termos de Serviço</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold text-foreground">Contato</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Rua da Facilidade, 123, Cidade Agendada, CA 90210
            </p>
            <p className="text-sm text-muted-foreground">
              Email: suporte@easyagenda.com
            </p>
            <p className="text-sm text-muted-foreground">
              Telefone: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="flex items-center justify-center text-sm text-muted-foreground">
            <Copyright className="mr-1 h-4 w-4" /> {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
