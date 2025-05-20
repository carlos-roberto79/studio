
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; 
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, CalendarDays, PlusCircle, ExternalLink, Bell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);

const mockAppointments = [
    { id: "1", date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0), duration: 60, title: "Consulta - Ana P.", service: "Aconselhamento", status: "Confirmado" },
    { id: "2", date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0), duration: 90, title: "Sessão - Carlos M.", service: "Terapia Intensiva", status: "Confirmado" },
    { id: "3", date: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 11, 30), duration: 45, title: "Check-up - Sofia L.", service: "Avaliação", status: "Pendente" },
    { id: "4", date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), duration: 60, title: "Reunião - Equipe Alpha", service: "Interno", status: "Bloqueio" },
];


export default function ProfessionalCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const { toast } = useToast();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  
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

  const handleAddEvent = () => {
    if (!selectedDate || !eventTitle || !eventTime) {
        toast({ title: "Erro", description: "Data, título e hora do evento são obrigatórios.", variant: "destructive" });
        return;
    }
    console.log("BACKEND_SIM: Adicionando novo evento/bloqueio:", { date: selectedDate, title: eventTitle, time: eventTime });
    toast({ title: "Evento Adicionado (Simulação)", description: `O evento "${eventTitle}" foi adicionado para ${selectedDate.toLocaleDateString('pt-BR')} às ${eventTime}.` });
    setIsEventModalOpen(false);
    setEventTitle("");
    setEventTime("");
  }

  const bookedDays = mockAppointments.map(a => a.date);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
            <CalendarDays className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Meu Calendário Completo
          </CardTitle>
          <CardDescription>Visualize e gerencie todos os seus agendamentos. <span className="text-xs text-muted-foreground">(Dados mockados)</span></CardDescription>
        </CardHeader>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-stretch sm:items-center w-full sm:w-auto">
            <div className="relative self-end sm:self-center mb-2 sm:mb-0">
                <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </div>
            <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard/professional/availability">
                    <Clock className="mr-2 h-4 w-4" /> Definir Disponibilidade
                </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/professional">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
            </Link>
            </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Label className="text-sm font-medium">Visualizar por:</Label>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
                <SelectTrigger className="w-full sm:w-[120px]">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Selecione uma Data</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <ShadCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border p-0"
                        locale={{
                            localize: { month: n => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][n], day: n => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][n]},
                            formatLong: { date: () => 'dd/MM/yyyy' }, 
                        }}
                        modifiers={{ booked: bookedDays }}
                        modifiersClassNames={{ booked: 'text-primary font-bold relative after:content-["•"] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:text-lg' }}
                    />
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="shadow-lg min-h-[400px]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle className="text-lg sm:text-xl">
                            Agendamentos para {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Nenhuma data selecionada"}
                        </CardTitle>
                        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="w-full sm:w-auto"> <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Bloqueio/Evento</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Bloqueio/Evento para {selectedDate?.toLocaleDateString('pt-BR')}</DialogTitle>
                                    <DialogDescription>
                                        Insira os detalhes para bloquear um horário ou adicionar um evento pessoal. (Simulação)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="event-title" className="text-right">Título</Label>
                                        <Input id="event-title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="col-span-3" placeholder="Ex: Almoço, Reunião Interna"/>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="event-time" className="text-right">Hora</Label>
                                        <Input id="event-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                    <Button onClick={handleAddEvent}>Salvar Evento</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {appointmentsForSelectedDate.length > 0 ? (
                        <ul className="space-y-4">
                        {appointmentsForSelectedDate.map(appt => (
                            <li key={appt.id} className="p-4 border rounded-lg hover:bg-secondary/50">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-base sm:text-lg">{appt.title}</p>
                                        <p className="text-sm text-muted-foreground">{appt.service}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(appt.date.getTime() + appt.duration * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <Badge variant={appt.status === "Confirmado" ? "default" : "outline"} 
                                               className={
                                                appt.status === "Confirmado" ? "bg-green-500 hover:bg-green-600 text-white" : 
                                                appt.status === "Pendente" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : 
                                                appt.status === "Bloqueio" ? "bg-slate-500 hover:bg-slate-600 text-white" : ""
                                               } >{appt.status}</Badge>
                                        <Button variant="link" size="sm" className="p-0 h-auto text-primary mt-1 block">
                                            Ver Detalhes <ExternalLink className="ml-1 h-3 w-3 inline-block" />
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
