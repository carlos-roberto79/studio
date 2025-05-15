
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, CalendarDays, Users, BarChart2, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Label } from "@/components/ui/label"; // Adicionado Label

// Mock data for professionals and services
const mockProfessionals = [
    { id: "prof1", name: "Dr. João Silva" },
    { id: "prof2", name: "Dra. Maria Oliveira" },
    { id: "prof3", name: "Carlos Souza" },
];
const mockServices = [
    { id: "serv1", name: "Consulta Geral" },
    { id: "serv2", name: "Limpeza Dental" },
    { id: "serv3", name: "Corte de Cabelo" },
];

// Mock data for schedules
const mockSchedules = [
  { id: "1", professional: "Dr. João Silva", service: "Consulta Geral", client: "Ana P.", date: "2024-08-01", time: "10:00", status: "Confirmado" },
  { id: "2", professional: "Dra. Maria Oliveira", service: "Limpeza Dental", client: "Beatriz C.", date: "2024-08-01", time: "11:00", status: "Pendente" },
  { id: "3", professional: "Carlos Souza", service: "Corte de Cabelo", client: "Carlos M.", date: "2024-08-01", time: "14:00", status: "Cancelado Cliente" },
  { id: "4", professional: "Dr. João Silva", service: "Consulta Geral", client: "Daniel F.", date: "2024-08-02", time: "15:00", status: "Confirmado" },
  { id: "5", professional: "Dra. Maria Oliveira", service: "Limpeza Dental", client: "Eduarda G.", date: "2024-08-03", time: "09:00", status: "Pendente Pagamento" },
  { id: "6", professional: "Carlos Souza", service: "Corte de Cabelo", client: "Fernanda L.", date: "2024-08-03", time: "16:00", status: "Cancelado Profissional" },
];

const mockChartData = [
  { day: "Seg", appointments: 12, cancellations: 2 },
  { day: "Ter", appointments: 15, cancellations: 1 },
  { day: "Qua", appointments: 10, cancellations: 0 },
  { day: "Qui", appointments: 18, cancellations: 3 },
  { day: "Sex", appointments: 20, cancellations: 1 },
  { day: "Sáb", appointments: 8, cancellations: 0 },
];

const chartConfig = {
  appointments: { label: "Agendamentos", color: "hsl(var(--chart-1))" },
  cancellations: { label: "Cancelamentos", color: "hsl(var(--chart-2))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];


export default function CompanySchedulesOverviewPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    document.title = `Visão Geral de Agendas - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A visualização da agenda seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de agenda:", { viewMode, selectedProfessional, selectedService, selectedDate });
    // Em um app real, buscaria dados com base nos filtros
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <CalendarDays className="mr-3 h-8 w-8 text-primary" /> Visão Geral de Agendas
          </CardTitle>
          <CardDescription>Monitore todos os compromissos e a utilização da agenda da sua empresa.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Filtros e Visualização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Visualizar Por:</Label>
              <div className="flex space-x-1 mt-1">
                <Button variant={viewMode === "day" ? "default" : "outline"} onClick={() => setViewMode("day")}>Dia</Button>
                <Button variant={viewMode === "week" ? "default" : "outline"} onClick={() => setViewMode("week")}>Semana</Button>
                <Button variant={viewMode === "month" ? "default" : "outline"} onClick={() => setViewMode("month")}>Mês</Button>
              </div>
            </div>
             <div>
                <Label htmlFor="schedule-date">Data de Referência</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="schedule-date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal mt-1"
                    >
                        {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <ShadCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div>
              <Label htmlFor="professional-filter-agenda">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-agenda" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Profissionais</SelectItem>
                  {mockProfessionals.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service-filter-agenda">Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-filter-agenda" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Serviços</SelectItem>
                  {mockServices.map(serv => (
                    <SelectItem key={serv.id} value={serv.id}>{serv.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleApplyFilters}><Eye className="mr-2 h-4 w-4"/> Visualizar</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BarChart2 className="mr-2 h-5 w-5"/> Análise de Agendamentos (Semanal - Mock)</CardTitle>
           <CardDescription>Picos de agendamentos, horários ociosos e cancelamentos.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[400px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
                    <Bar dataKey="cancellations" fill="var(--color-cancellations)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-yellow-500"/> Agendamentos Pendentes ou Cancelados Recentes</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockSchedules.filter(s => s.status.includes("Pendente") || s.status.includes("Cancelado")).slice(0,5).map(schedule => ( // Show a few examples
                        <TableRow key={schedule.id}>
                            <TableCell>{schedule.professional}</TableCell>
                            <TableCell>{schedule.service}</TableCell>
                            <TableCell>{schedule.client}</TableCell>
                            <TableCell>{format(new Date(schedule.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell>{schedule.time}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                    schedule.status.includes("Pendente") ? "bg-yellow-100 text-yellow-700" : 
                                    schedule.status.includes("Cancelado") ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700"
                                }`}>
                                    {schedule.status}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Visualização Completa da Agenda (Placeholder)</CardTitle>
            <CardDescription>Aqui seria exibida uma grade de calendário detalhada (dia/semana/mês) com todos os agendamentos. Implementação complexa.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-10 text-center text-muted-foreground bg-muted rounded-md">
                (Placeholder para a grade visual da agenda da empresa)
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

    
