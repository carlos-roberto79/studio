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
              Simplifying your appointments, effortlessly.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="/#pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold text-foreground">Contact</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              123 Easy Street, Schedule City, CA 90210
            </p>
            <p className="text-sm text-muted-foreground">
              Email: support@easyagenda.com
            </p>
            <p className="text-sm text-muted-foreground">
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="flex items-center justify-center text-sm text-muted-foreground">
            <Copyright className="mr-1 h-4 w-4" /> {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
