
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; // Full page calendar
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, CalendarDays, PlusCircle, ExternalLink, Bell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Mock data for appointments - in a real app, this would come from a backend
const mockAppointments = [
    { id: "1", date: new Date(2024, 6, 25, 10, 0), duration: 60, title: "Consulta - Ana P.", service: "Aconselhamento", status: "Confirmado" },
    { id: "2", date: new Date(2024, 6, 25, 14, 0), duration: 90, title: "Sessão - Carlos M.", service: "Terapia Intensiva", status: "Confirmado" },
    { id: "3", date: new Date(2024, 6, 26, 11, 30), duration: 45, title: "Check-up - Sofia L.", service: "Avaliação", status: "Pendente" },
    // Use a date in the future for mock data to be visible in calendar
];
// Adjust mock data date to be in the future for better visualization
const today = new Date();
mockAppointments[0].date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0);
mockAppointments[1].date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0);
mockAppointments[2].date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 30);


export default function ProfessionalCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day"); // Placeholder for view mode logic
  
  useEffect(() => {
    document.title = `Meu Calendário - ${APP_NAME}`;
  }, []);

  const appointmentsForSelectedDate = selectedDate 
    ? mockAppointments.filter(appt => 
        appt.date.getFullYear() === selectedDate.getFullYear() &&
        appt.date.getMonth() === selectedDate.getMonth() &&
        appt.date.getDate() === selectedDate.getDate()
      ).sort((a,b) => a.date.getTime() - b.date.getTime())
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" /> Meu Calendário Completo
          </CardTitle>
          <CardDescription>Visualize e gerencie todos os seus agendamentos.</CardDescription>
        </CardHeader>
        <div className="flex space-x-2 items-center">
            <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span> {/* Mocked notification count */}
            </div>
            <Button variant="outline" asChild>
                <Link href="/dashboard/professional/availability">
                    <Clock className="mr-2 h-4 w-4" /> Definir Disponibilidade
                </Link>
            </Button>
            <Button variant="outline" asChild>
            <Link href="/dashboard/professional">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
            </Link>
            </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center space-x-2">
            <Label className="text-sm font-medium">Visualizar por:</Label>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Dia"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">(Funcionalidade de visualização por semana/mês é um placeholder)</span>
        </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Selecione uma Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <ShadCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border p-0"
                        locale={{
                            localize: { month: n => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][n], day: n => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][n]},
                            formatLong: {}
                        } as any}
                        modifiers={{ booked: mockAppointments.map(a => a.date) }}
                        modifiersClassNames={{ booked: 'text-primary font-bold relative after:content-["•"] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:text-lg' }}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="shadow-lg min-h-[400px]">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                            Agendamentos para {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Nenhuma data selecionada"}
                        </CardTitle>
                        <Button size="sm"> <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Bloqueio/Evento</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {appointmentsForSelectedDate.length > 0 ? (
                        <ul className="space-y-4">
                        {appointmentsForSelectedDate.map(appt => (
                            <li key={appt.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-lg">{appt.title}</p>
                                        <p className="text-sm text-muted-foreground">{appt.service}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(appt.date.getTime() + appt.duration * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={appt.status === "Confirmado" ? "default" : "outline"} 
                                               className={appt.status === "Confirmado" ? "bg-green-500 hover:bg-green-600" : appt.status === "Pendente" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""} >{appt.status}</Badge>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-primary mt-1">
                                            Ver Detalhes <ExternalLink className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-10">
                            {selectedDate ? "Nenhum agendamento para este dia." : "Selecione uma data para ver os agendamentos."}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    