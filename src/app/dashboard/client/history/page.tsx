
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';
import Link from "next/link";
import { ArrowLeft, HistoryIcon, Repeat, XCircle, CreditCard } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

// Mock data for past appointments
const pastAppointments = [
  { id: "1", date: "15 de Junho de 2024", time: "10:00", service: "Corte de Cabelo", professional: "João Dantas", company: "Salão Cortes Modernos", status: "Concluído", companyLogo: "https://placehold.co/40x40.png?text=CM", paymentStatus: "Pago" },
  { id: "2", date: "01 de Junho de 2024", time: "15:30", service: "Limpeza de Pele", professional: "Dra. Ana Souza", company: "Clínica Pele Bela", status: "Concluído", companyLogo: "https://placehold.co/40x40.png?text=PB", paymentStatus: "Pago" },
  { id: "3", date: "20 de Maio de 2024", time: "09:00", service: "Consulta Odontológica", professional: "Dr. Carlos Lima", company: "Sorrisos Brilhantes Dental", status: "Cancelado pelo cliente", companyLogo: "https://placehold.co/40x40.png?text=SB", paymentStatus: "Reembolsado Parcial" },
  { id: "4", date: "10 de Julho de 2024", time: "16:00", service: "Sessão de Terapia", professional: "Maria Garcia", company: "Mente Serena Terapias", status: "Confirmado", companyLogo: "https://placehold.co/40x40.png?text=MS", paymentStatus: "Pendente (Taxa)" },
];


export default function ClientHistoryPage() {
  const { toast } = useToast();
  useEffect(() => {
    document.title = `Histórico de Agendamentos - ${APP_NAME}`;
  }, []);

  const handleCancelAppointment = (apptId: string) => {
    // Lógica de cancelamento (simulada)
    console.log(`BACKEND_SIM: Solicitação de cancelamento para agendamento ID: ${apptId}`);
    toast({ title: "Cancelamento Solicitado (Simulação)", description: "Seu pedido de cancelamento foi enviado." });
    // Aqui você atualizaria o estado ou faria uma chamada de API
  };
  
  const handleRescheduleAppointment = (apptId: string) => {
    // Lógica de reagendamento (simulada)
    console.log(`BACKEND_SIM: Redirecionar para reagendamento do agendamento ID: ${apptId}`);
    toast({ title: "Redirecionando para Reagendamento (Simulação)", description: "Você seria redirecionado para escolher um novo horário." });
    // router.push(`/schedule/${companySlug}/reschedule/${apptId}`); // Exemplo
  };


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
          {pastAppointments.length > 0 ? (
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
                {pastAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Image src={appt.companyLogo} alt={appt.company} width={24} height={24} className="rounded-sm" data-ai-hint="logotipo empresa" />
                        <span>{appt.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appt.service}</TableCell>
                    <TableCell>{appt.professional}</TableCell>
                    <TableCell>{appt.date}</TableCell>
                    <TableCell>{appt.time}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            appt.status === "Concluído" ? "bg-green-100 text-green-700" : 
                            appt.status.startsWith("Cancelado") ? "bg-red-100 text-red-700" : 
                            appt.status === "Confirmado" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700" // Pendente ou outros
                        }`}>
                            {appt.status}
                        </span>
                    </TableCell>
                    <TableCell>
                       <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            appt.paymentStatus === "Pago" ? "bg-green-100 text-green-700" : 
                            appt.paymentStatus.startsWith("Pendente") ? "bg-yellow-100 text-yellow-700" : 
                            appt.paymentStatus.startsWith("Reembolsado") ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                        }`}>
                            {appt.paymentStatus}
                        </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {appt.status === "Confirmado" && ( // Ações apenas para agendamentos confirmados (exemplo)
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleRescheduleAppointment(appt.id)} title="Reagendar">
                            <Repeat className="h-4 w-4 text-blue-600"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancelAppointment(appt.id)} title="Cancelar Agendamento">
                            <XCircle className="h-4 w-4 text-red-600"/>
                          </Button>
                        </>
                      )}
                       {appt.paymentStatus.startsWith("Pendente") && (
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
            <p className="text-muted-foreground text-center py-8">Você ainda não possui histórico de agendamentos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    