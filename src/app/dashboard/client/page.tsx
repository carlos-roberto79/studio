
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, History, Star, Settings, Bell, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const upcomingClientAppointments = [
  { id: "1", date: "Amanhã, 25 de Junho", time: "14:00", service: "Check-up Odontológico", professional: "Dr. Alice Silva", company: "Sorrisos Brilhantes Dental", companyLogo: "https://placehold.co/40x40.png?text=SB" },
  { id: "2", date: "1 de Julho", time: "16:30", service: "Corte & Estilo", professional: "João Dantas", company: "Salão Cortes Modernos", companyLogo: "https://placehold.co/40x40.png?text=CM" },
];

const clientStats = [
    { title: "Próximos Agendamentos", value: "2", icon: <CalendarPlus className="h-6 w-6 text-primary" /> },
    { title: "Agendamentos Passados", value: "15", icon: <History className="h-6 w-6 text-primary" /> },
    { title: "Profissionais Favoritos", value: "3", icon: <Star className="h-6 w-6 text-primary" /> },
];

const mockClientAlerts = [
    "Seu agendamento de 'Check-up Odontológico' é amanhã às 14:00.",
    "Pagamento pendente para 'Sessão de Terapia'.",
    "🎉 Aproveite! Desconto de 15% em todos os serviços de spa esta semana."
];

export default function ClientPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = `Painel do Cliente - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (role !== USER_ROLES.CLIENT) {
        router.push('/dashboard');
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  if (loading || !user || (user && role !== USER_ROLES.CLIENT)) {
    return (
      <div className="space-y-8">
        <CardHeader className="px-0">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card className="shadow-lg">
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
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Painel do Cliente</CardTitle>
        <CardDescription>Veja seus próximos agendamentos e gerencie suas reservas.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clientStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
               {/* Optional: <p className="text-xs text-muted-foreground">Ver todos</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Seus Próximos Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingClientAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingClientAppointments.map((appt) => (
                <li key={appt.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Image src={appt.companyLogo} alt={appt.company} width={40} height={40} className="rounded-md" data-ai-hint="logotipo empresa prédio" />
                            <div>
                                <p className="font-semibold text-lg">{appt.service}</p>
                                <p className="text-sm text-muted-foreground">com {appt.professional} em {appt.company}</p>
                                <p className="text-sm text-muted-foreground">{appt.date} - {appt.time}</p>
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

      <Card className="shadow-lg">
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
    </div>
  );
}
