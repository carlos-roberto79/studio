
"use client";
import { NotificationGeneratorForm } from "@/components/notifications/NotificationGeneratorForm";
import type { Metadata } from "next";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

// Metadata é estático, então não precisa de generateMetadata aqui
// export const metadata: Metadata = {
//   title: `Testador de Notificações IA - ${APP_NAME}`,
//   description: `Teste e gere notificações inteligentes usando IA para ${APP_NAME}.`,
// };

export default function NotificationsTesterPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Definir o título do documento aqui, pois metadata pode não ser suficiente para páginas cliente
    document.title = `Testador de Notificações IA - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== USER_ROLES.COMPANY_ADMIN && role !== USER_ROLES.PROFESSIONAL) {
        router.push('/dashboard'); // Ou uma página de acesso negado mais específica
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || (user && (role !== USER_ROLES.COMPANY_ADMIN && role !== USER_ROLES.PROFESSIONAL))) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Wand2 className="h-8 w-8 text-primary" />
              <Skeleton className="h-7 w-3/5" />
            </div>
            <Skeleton className="h-5 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
      <NotificationGeneratorForm />
    </div>
  );
}
