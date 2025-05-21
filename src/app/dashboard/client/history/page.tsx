
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, HistoryIcon, Repeat, XCircle, CreditCard, CalendarX2 } from "lucide-react"; 
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getClientAppointments, type AppointmentData } from "@/services/supabaseService";
import { format, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";


export default function ClientHistoryPage() {
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  useEffect(() => {
    document.title = `Histórico de Agendamentos - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      if (role !== USER_ROLES.CLIENT) {
        router.push('/dashboard');
      } else {
        setIsLoadingAppointments(true);
        getClientAppointments(user.id)
          .then(allAppointments => {
            setAppointments(allAppointments.sort((a,b) => parseISO(b.appointment_datetime).getTime() - parseISO(a.appointment_datetime).getTime())); // Mais recentes primeiro
          })
          .catch(error => {
            console.error("Erro ao buscar histórico de agendamentos:", error);
            // toast({ title: "Erro", description: "Não foi possível carregar seu histórico.", variant: "destructive" });
          })
          .finally(() => setIsLoadingAppointments(false));
      }
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, role, authLoading, router]);


  const handleCancelAppointment = (apptId: string) => {
    console.log(`BACKEND_SIM: Solicitação de cancelamento para agendamento ID: ${apptId}`);
    toast({ title: "Cancelamento Solicitado (Simulação)", description: "Seu pedido de cancelamento foi enviado." });
  };
  
  const handleRescheduleAppointment = (apptId: string) => {
    console.log(`BACKEND_SIM: Redirecionar para reagendamento do agendamento ID: ${apptId}`);
    toast({ title: "Redirecionando para Reagendamento (Simulação)", description: "Você seria redirecionado para escolher um novo horário." });
  };

  if (authLoading || isLoadingAppointments) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <CardHeader className="px-0"><Skeleton className="h-10 w-72" /><Skeleton className="h-5 w-96 mt-2" /></CardHeader>
                <Skeleton className="h-9 w-36" />
            </div>
            <Card className="shadow-lg">
                <CardContent className="pt-6">
                    {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-1 flex-grow">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <HistoryIcon className="mr-3 h-8 w-8 text-primary" /> Histórico de Agendamentos
          </CardTitle>
          <CardDescription>Veja todos os seus agendamentos passados e futuros.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status Ag.</TableHead>
                  <TableHead>Status Pgto.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Image 
                          src={appt.companies?.logo_url || "https://placehold.co/40x40.png?text=Emp"} 
                          alt={appt.companies?.company_name || "Logo Empresa"} 
                          width={24} height={24} 
                          className="rounded-sm" 
                          data-ai-hint="logotipo empresa" />
                        <span>{appt.companies?.company_name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appt.service_name}</TableCell>
                    <TableCell>{appt.professional_name || "N/A"}</TableCell>
                    <TableCell>{format(parseISO(appt.appointment_datetime), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{format(parseISO(appt.appointment_datetime), "HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            appt.status === "concluido" ? "bg-green-100 text-green-700" : 
                            appt.status.startsWith("cancelado") ? "bg-red-100 text-red-700" : 
                            appt.status === "confirmado" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700" 
                        }`}>
                            {appt.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    </TableCell>
                    <TableCell>
                       <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            appt.payment_status === "pago" ? "bg-green-100 text-green-700" : 
                            appt.payment_status?.startsWith("pendente") ? "bg-yellow-100 text-yellow-700" : 
                            appt.payment_status === "reembolsado" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                        }`}>
                            {appt.payment_status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}
                        </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {appt.status === "confirmado" && ( 
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleRescheduleAppointment(appt.id)} title="Reagendar">
                            <Repeat className="h-4 w-4 text-blue-600"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancelAppointment(appt.id)} title="Cancelar Agendamento">
                            <XCircle className="h-4 w-4 text-red-600"/>
                          </Button>
                        </>
                      )}
                       {appt.payment_status?.startsWith("pendente") && (
                         <Button variant="link" size="sm" className="p-0 h-auto text-primary" title="Realizar Pagamento">
                            <CreditCard className="mr-1 h-4 w-4"/> Pagar
                         </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CalendarX2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">Você ainda não possui histórico de agendamentos.</p>
              <p className="text-sm text-muted-foreground mt-2">Que tal marcar seu primeiro horário?</p>
              <Button className="mt-6" asChild>
                <Link href="/schedule/example-company"> {/* Placeholder link */}
                   Marcar Novo Agendamento
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
