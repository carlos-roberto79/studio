
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Copyright } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{APP_NAME}</h3>
            {/* Tagline removida daqui */}
          </div>
          {/* Seção de Links Rápidos já havia sido removida */}
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

