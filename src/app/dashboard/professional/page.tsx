
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, UserCheck, Settings, Edit3, Bell, Users } from "lucide-react"; // Adicionado Users
import Link from "next/link";
import Image from "next/image"; 
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const upcomingAppointments = [
  { id: "1", time: "10:00", clientName: "Alice Johnson", service: "Corte de Cabelo", avatar: "https://placehold.co/40x40.png?text=AJ" },
  { id: "2", time: "11:30", clientName: "Bob Williams", service: "Consulta", avatar: "https://placehold.co/40x40.png?text=BW" },
  { id: "3", time: "14:00", clientName: "Carol Davis", service: "Check-up", avatar: "https://placehold.co/40x40.png?text=CD" },
];

const professionalStats = [
    { title: "Agendamentos Hoje", value: "7", icon: <Calendar className="h-6 w-6 text-primary" /> },
    { title: "Horários Disponíveis", value: "3", icon: <Clock className="h-6 w-6 text-primary" /> },
    { title: "Total de Clientes Atendidos", value: "48", icon: <UserCheck className="h-6 w-6 text-primary" /> },
];

const mockProfessionalAlerts = [
    "Novo agendamento: Carol Davis às 14:00 para Check-up.",
    "Lembrete: Alice Johnson às 10:00 para Corte de Cabelo.",
    "Sua disponibilidade para próxima semana não foi configurada."
];


export default function ProfessionalPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = `Painel do Profissional - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (role !== USER_ROLES.PROFESSIONAL) {
        router.push('/dashboard');
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  if (loading || !user || (user && role !== USER_ROLES.PROFESSIONAL)) {
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
        <CardTitle className="text-3xl font-bold">Painel do Profissional</CardTitle>
        <CardDescription>Gerencie sua agenda, agendamentos e disponibilidade.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Alertas e Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
            {mockProfessionalAlerts.length > 0 ? (
                <ul className="space-y-2">
                    {mockProfessionalAlerts.map((alert, index) => (
                        <li key={index} className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">{alert}</li>
                    ))}
                </ul>
            ) : <p className="text-muted-foreground">Nenhum alerta no momento.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professionalStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* Optional: <p className="text-xs text-muted-foreground">+2 de ontem</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Próximos Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50">
                  <div className="flex items-center space-x-3">
                    <Image src={appt.avatar} alt={appt.clientName} width={40} height={40} className="rounded-full" data-ai-hint="avatar pessoa" />
                    <div>
                      <p className="font-semibold">{appt.clientName}</p>
                      <p className="text-sm text-muted-foreground">{appt.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appt.time}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-primary">Ver Detalhes</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhum agendamento próximo para hoje.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Gerencie Sua Agenda e Clientes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/availability">
              <Clock className="mr-2 h-5 w-5" /> Definir Disponibilidade
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/calendar">
              <Calendar className="mr-2 h-5 w-5" /> Ver Calendário Completo
            </Link>
          </Button>
           <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/clients/client123"> {/* Placeholder Link */}
              <Users className="mr-2 h-5 w-5" /> Ver Perfil de Cliente (Teste)
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/professional/profile">
              <Edit3 className="mr-2 h-5 w-5" /> Editar Meu Perfil
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
    
