
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as ShadCalendar } from "@/components/ui/calendar"; 
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, CalendarDays, PlusCircle, ExternalLink, Bell, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getProfessionalByUserId, type ProfessionalData, getAgendaBlocksByCompany, type AgendaBlockData } from "@/services/supabaseService";
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);

// Mock appointments - manteremos mockado por enquanto, foco nos bloqueios
const mockAppointments = [
    { id: "1", date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0), duration: 60, title: "Consulta - Ana P.", service: "Aconselhamento", status: "Confirmado" },
    { id: "2", date: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0), duration: 90, title: "Sessão - Carlos M.", service: "Terapia Intensiva", status: "Confirmado" },
    { id: "3", date: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 11, 30), duration: 45, title: "Check-up - Sofia L.", service: "Avaliação", status: "Pendente" },
    { id: "4", date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), duration: 60, title: "Reunião - Equipe Alpha", service: "Interno", status: "Bloqueio" },
];


export default function ProfessionalCalendarPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const { toast } = useToast();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [agendaBlocks, setAgendaBlocks] = useState<AgendaBlockData[]>([]);
  const [blockedDays, setBlockedDays] = useState<Date[]>([]);
  
  useEffect(() => {
    document.title = `Meu Calendário - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.PROFESSIONAL) {
      setIsLoading(true);
      getProfessionalByUserId(user.id)
        .then(profData => {
          if (profData) {
            setProfessionalProfile(profData);
            if (profData.company_id) {
              fetchAgendaBlocks(profData.company_id, profData.id);
            } else {
               console.warn("ID da empresa não encontrado para o profissional.");
               setIsLoading(false);
            }
          } else {
            toast({ title: "Erro", description: "Perfil profissional não encontrado.", variant: "destructive" });
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error("Erro ao buscar dados do profissional:", error);
          toast({ title: "Erro ao Carregar Perfil", description: "Não foi possível carregar seus dados.", variant: "destructive" });
          setIsLoading(false);
        });
    } else if (!authLoading && !user) {
      setIsLoading(false); // Evita loop
    }
  }, [user, role, authLoading, toast]);

  const fetchAgendaBlocks = async (companyId: string, professionalId?: string) => {
    try {
      const blocks = await getAgendaBlocksByCompany(companyId);
      const relevantBlocks = blocks.filter(block => 
        block.active && 
        (block.target_type === 'empresa' || (block.target_type === 'profissional' && block.professional_id === professionalId))
      );
      setAgendaBlocks(relevantBlocks);
      
      const processedBlockedDays = relevantBlocks.reduce((acc: Date[], block) => {
        try {
            const startDate = startOfDay(parseISO(block.start_time));
            // Para simplificar, apenas marcamos o dia de início.
            // Lógica de recorrência e multi-dia seria mais complexa aqui.
            if (!acc.some(d => isSameDay(d, startDate))) {
                acc.push(startDate);
            }
        } catch (e) {
            console.error("Erro ao processar data do bloqueio:", block.start_time, e);
        }
        return acc;
      }, []);
      setBlockedDays(processedBlockedDays);
    } catch (error) {
      console.error("Erro ao buscar bloqueios de agenda:", error);
      toast({ title: "Erro ao Carregar Bloqueios", description: "Não foi possível carregar os bloqueios da agenda.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const appointmentsForSelectedDate = selectedDate 
    ? mockAppointments.filter(appt => 
        isSameDay(appt.date, selectedDate)
      ).sort((a,b) => a.date.getTime() - b.date.getTime())
    : [];

  const handleAddEvent = () => {
    if (!selectedDate || !eventTitle || !eventTime) {
        toast({ title: "Erro", description: "Data, título e hora do evento são obrigatórios.", variant: "destructive" });
        return;
    }
    // TODO: Em uma implementação real, esta ação criaria um AgendaBlock
    console.log("BACKEND_SIM: Adicionando novo evento/bloqueio:", { date: selectedDate, title: eventTitle, time: eventTime });
    toast({ title: "Evento Adicionado (Simulação)", description: `O evento "${eventTitle}" foi adicionado para ${selectedDate.toLocaleDateString('pt-BR')} às ${eventTime}. Recarregue os bloqueios para ver no calendário.` });
    setIsEventModalOpen(false);
    setEventTitle("");
    setEventTime("");
  }

  const appointmentDays = mockAppointments.map(a => startOfDay(a.date));

  const allMarkedDays = [...appointmentDays, ...blockedDays];
  const uniqueMarkedDays = allMarkedDays.reduce((acc: Date[], current) => {
    if (!acc.some(date => isSameDay(date, current))) {
      acc.push(current);
    }
    return acc;
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Skeleton className="h-12 w-3/5" />
            <div className="flex gap-2 w-full sm:w-auto"><Skeleton className="h-9 w-1/2 sm:w-32" /><Skeleton className="h-9 w-1/2 sm:w-32" /></div>
        </div>
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
            <CalendarDays className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Meu Calendário Completo
          </CardTitle>
          <CardDescription>Visualize e gerencie todos os seus agendamentos. <span className="text-xs text-muted-foreground">(Dados de agendamentos mockados)</span></CardDescription>
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
                    <SelectItem value="week">Semana (placeholder)</SelectItem>
                    <SelectItem value="month">Mês (placeholder)</SelectItem>
                </SelectContent>
            </Select>
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
                        locale={ptBR}
                        modifiers={{ 
                            appointments: appointmentDays,
                            blocked: blockedDays 
                        }}
                        modifiersClassNames={{ 
                            appointments: 'bg-blue-100 text-blue-700 rounded-full font-semibold relative after:content-["•"] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:text-lg after:text-blue-500', 
                            blocked: 'text-red-500 relative after:content-["✕"] after:absolute after:-bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:text-sm after:font-bold'
                        }}
                    />
                </CardContent>
                 <CardFooter className="text-xs text-muted-foreground p-3">
                    <p className="flex items-center"><span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span> Dia com agendamentos</p>
                    <p className="flex items-center ml-2"><span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span> Dia com bloqueio</p>
                </CardFooter>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="shadow-lg min-h-[400px]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle className="text-lg sm:text-xl">
                            Agendamentos para {selectedDate ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Nenhuma data selecionada"}
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
                                            {format(appt.date, "HH:mm", { locale: ptBR })} - {format(new Date(appt.date.getTime() + appt.duration * 60000), "HH:mm", { locale: ptBR })}
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
                        <div className="text-muted-foreground text-center py-10 space-y-2">
                            <p>
                                {selectedDate ? "Nenhum agendamento para este dia." : "Selecione uma data para ver os agendamentos."}
                            </p>
                            {agendaBlocks.filter(b => selectedDate && isSameDay(parseISO(b.start_time), selectedDate)).map(block => (
                                <div key={block.id} className="p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                                    <AlertTriangle className="inline h-4 w-4 mr-1" /> <strong>Bloqueio:</strong> {block.reason} (
                                    {format(parseISO(block.start_time), 'HH:mm')} - {format(parseISO(block.end_time), 'HH:mm')}
                                    {block.target_type === 'empresa' && ', Empresa Inteira'}
                                    )
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

</content>
  </change>
  <change>
    <file>/src/components/ui/calendar.tsx</file>
    <content><![CDATA[
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DateFormatter } from "react-day-picker"
import { ptBR } from 'date-fns/locale'; // Importar ptBR

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Formatter para pt-BR
const formatCaption: DateFormatter = (month, options) => {
  return format(month, 'LLLL yyyy', {locale: options?.locale}); // Ex: "julho 2024"
};

import { format } from 'date-fns'; // Certifique-se que format está importado

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR, // Definir ptBR como locale padrão
  formatters = { formatCaption }, // Aplicar o formatter
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize", // Adicionado capitalize
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      locale={locale} // Passar o locale para DayPicker
      formatters={formatters} // Passar os formatters para DayPicker
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

