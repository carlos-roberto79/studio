
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, History, Star, Settings, Bell, Package, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getClientAppointments, type AppointmentData } from "@/services/supabaseService";
import { format, isFuture, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ONBOARDING_STORAGE_KEY = 'tdsagenda_client_onboarding_complete_v1';

const onboardingSteps = [
  {
    title: "Bem-vindo(a) ao seu Painel!",
    description: "Este é o seu espaço para gerenciar todos os seus agendamentos. Vamos dar uma olhada rápida nas principais seções.",
    targetId: "client-dashboard-title", // ID do CardHeader principal
  },
  {
    title: "Alertas e Lembretes",
    description: "Aqui você verá notificações importantes sobre seus agendamentos, pagamentos pendentes ou promoções.",
    targetId: "client-alerts-card",
  },
  {
    title: "Suas Estatísticas",
    description: "Acompanhe rapidamente seus próximos agendamentos, histórico e outras informações relevantes.",
    targetId: "client-stats-grid",
  },
  {
    title: "Próximos Agendamentos",
    description: "Seus compromissos futuros são listados aqui para fácil acesso. Você pode gerenciá-los diretamente.",
    targetId: "client-upcoming-appointments-card",
  },
  {
    title: "Ações da Conta",
    description: "Acesse seu histórico completo, gerencie planos e assinaturas, ou ajuste as configurações da sua conta.",
    targetId: "client-account-actions-card",
  }
];

export default function ClientPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentData[]>([]);
  const [pastAppointmentsCount, setPastAppointmentsCount] = useState<number>(0);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);

  useEffect(() => {
    document.title = `Painel do Cliente - ${APP_NAME}`;
    if (typeof window !== 'undefined') {
      const onboardingComplete = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (role !== USER_ROLES.CLIENT) {
        router.push('/dashboard');
      } else {
        setIsLoadingAppointments(true);
        getClientAppointments(user.id)
          .then(allAppointments => {
            const now = new Date();
            const futureAppts = allAppointments.filter(appt => isFuture(parseISO(appt.appointment_datetime)));
            const pastAppts = allAppointments.filter(appt => !isFuture(parseISO(appt.appointment_datetime)));
            
            setUpcomingAppointments(futureAppts.sort((a,b) => parseISO(a.appointment_datetime).getTime() - parseISO(b.appointment_datetime).getTime()).slice(0, 5));
            setPastAppointmentsCount(pastAppts.length);
          })
          .catch(error => {
            console.error("Erro ao buscar agendamentos do cliente:", error);
          })
          .finally(() => setIsLoadingAppointments(false));
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, role, authLoading, router]);

  const handleNextOnboardingStep = () => {
    if (currentOnboardingStep < onboardingSteps.length - 1) {
      setCurrentOnboardingStep(prev => prev + 1);
    } else {
      handleCloseOnboarding();
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    }
  };
  
  const clientStats = [
    { id: "stat-upcoming", title: "Próximos Agendamentos", value: upcomingAppointments.length.toString(), icon: <CalendarPlus className="h-6 w-6 text-primary" /> },
    { id: "stat-past", title: "Agendamentos Passados", value: pastAppointmentsCount.toString(), icon: <History className="h-6 w-6 text-primary" /> },
    { id: "stat-fav", title: "Profissionais Favoritos (Mock)", value: "3", icon: <Star className="h-6 w-6 text-primary" /> },
  ];

  const mockClientAlerts = [
    "Seu agendamento de 'Check-up Odontológico' é amanhã às 14:00.",
    "Pagamento pendente para 'Sessão de Terapia'.",
    "🎉 Aproveite! Desconto de 15% em todos os serviços de spa esta semana."
  ];


  if (authLoading || isLoadingAppointments || !user || (user && role !== USER_ROLES.CLIENT) ) {
    return (
      <div className="space-y-8">
        <CardHeader className="px-0" id="client-dashboard-title">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="client-stats-grid">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-lg" id="client-alerts-card">
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card className="shadow-lg" id="client-upcoming-appointments-card">
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CardHeader className="px-0" id="client-dashboard-title">
        <CardTitle className="text-3xl font-bold">Painel do Cliente</CardTitle>
        <CardDescription>Veja seus próximos agendamentos e gerencie suas reservas.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg" id="client-alerts-card">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Alertas e Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
            {mockClientAlerts.length > 0 ? (
                <ul className="space-y-2">
                    {mockClientAlerts.map((alert, index) => (
                        <li key={index} className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">{alert}</li>
                    ))}
                </ul>
            ) : <p className="text-muted-foreground">Nenhum alerta no momento.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="client-stats-grid">
        {clientStats.map(stat => (
          <Card key={stat.id} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg" id="client-upcoming-appointments-card">
        <CardHeader>
          <CardTitle>Seus Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Image 
                              src={appt.companies?.logo_url || "https://placehold.co/40x40.png?text=Emp"} 
                              alt={appt.companies?.company_name || "Logo Empresa"} 
                              width={40} height={40} 
                              className="rounded-md" 
                              data-ai-hint="logotipo empresa prédio" />
                            <div>
                                <p className="font-semibold text-lg">{appt.service_name}</p>
                                <p className="text-sm text-muted-foreground">com {appt.professional_name || 'N/A'} em {appt.companies?.company_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(parseISO(appt.appointment_datetime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                         <Button variant="outline" size="sm">Gerenciar</Button>
                    </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Você não tem próximos agendamentos. Pronto para marcar um?</p>
          )}
           <Button className="mt-6" asChild>
            <Link href="/schedule/example-company"> {/* Placeholder link */}
              <CalendarPlus className="mr-2 h-4 w-4" /> Marcar Novo Agendamento
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg" id="client-account-actions-card">
        <CardHeader>
          <CardTitle>Ações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/client/history">
              <History className="mr-2 h-5 w-5" /> Ver Histórico de Agendamentos
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/client/plans">
                <Package className="mr-2 h-5 w-5" /> Ver Planos e Assinaturas
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-5 w-5" /> Configurações da Conta
            </Link>
          </Button>
        </CardContent>
      </Card>

      {showOnboarding && currentOnboardingStep < onboardingSteps.length && (
        <AlertDialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-primary" />
                {onboardingSteps[currentOnboardingStep].title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {onboardingSteps[currentOnboardingStep].description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {currentOnboardingStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentOnboardingStep(prev => prev - 1)}>
                  Anterior
                </Button>
              )}
              <Button variant="outline" onClick={handleCloseOnboarding}>
                Pular Tour
              </Button>
              <AlertDialogAction onClick={handleNextOnboardingStep}>
                {currentOnboardingStep < onboardingSteps.length - 1 ? "Próximo" : "Concluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

