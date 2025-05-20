
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, BarChart3, Filter, FileDown, CalendarIcon, Percent, PieChart, CheckCircle } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"; 

const mockOccupancyStats = {
  totalSlots: 200,
  occupiedSlots: 150,
  occupancyRate: "75%",
};

const mockProfessionalOccupancy = [
  { id: "prof1", name: "João Dantas", rate: "85%", appointments: 50 },
  { id: "prof2", name: "Dra. Ana Souza", rate: "70%", appointments: 65 },
  { id: "prof3", name: "Dr. Carlos Lima", rate: "60%", appointments: 35 },
];

const mockDailyOccupancyChartData = [
  { day: "Seg", Ocupados: 20, Disponíveis: 10 },
  { day: "Ter", Ocupados: 25, Disponíveis: 5 },
  { day: "Qua", Ocupados: 18, Disponíveis: 12 },
  { day: "Qui", Ocupados: 28, Disponíveis: 2 },
  { day: "Sex", Ocupados: 30, Disponíveis: 5 },
  { day: "Sáb", Ocupados: 15, Disponíveis: 15 },
];
const chartConfig = {
  Disponíveis: { label: "Disponíveis", color: "hsl(var(--chart-2))" },
  Ocupados: { label: "Ocupados", color: "hsl(var(--chart-1))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];


export default function OccupancyReportPage() {
  const { toast } = useToast();
  const [occupancyStats, setOccupancyStats] = useState(mockOccupancyStats);
  const [professionalOccupancy, setProfessionalOccupancy] = useState(mockProfessionalOccupancy);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");

  useEffect(() => {
    document.title = `Relatório de Ocupação - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados de ocupação seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de ocupação:", { dateRange, selectedProfessional });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de ocupação seria exportado como ${format.toUpperCase()}.`});
  };

  const displayDateRange = () => {
    const { from, to } = dateRange || {};
    if (from && isValid(new Date(from))) {
      const fromFormatted = format(new Date(from), "dd/MM/yy", { locale: ptBR });
      if (to && isValid(new Date(to))) {
        const toFormatted = format(new Date(to), "dd/MM/yy", { locale: ptBR });
        return <>{fromFormatted} - {toFormatted}</>;
      }
      return fromFormatted;
    }
    return <span>Selecione um período</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center">
            <BarChart3 className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Relatório de Agenda e Ocupação
          </CardTitle>
          <CardDescription>Analise a utilização dos horários e o desempenho da sua equipe.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5"/> Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range-occupancy">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-occupancy" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    defaultMonth={dateRange?.from instanceof Date && isValid(dateRange.from) ? dateRange.from : undefined}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="professional-filter-occupancy">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-occupancy" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {mockProfessionalOccupancy.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"> 
                <Button onClick={handleApplyFilters} className="w-full mt-1 md:mt-0">
                    <Filter className="mr-2 h-4 w-4"/> Aplicar Filtros
                </Button>
            </div>
          </div>
           <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <Button onClick={() => handleExport("excel")} className="w-full sm:w-auto"><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")} className="w-full sm:w-auto"><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Horários Disponíveis</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{occupancyStats.totalSlots}</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Horários Ocupados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{occupancyStats.occupiedSlots}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Ocupação Média</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{occupancyStats.occupancyRate}</div></CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><PieChart className="mr-2 h-5 w-5"/> Ocupação por Dia da Semana (Exemplo)</CardTitle>
            <CardDescription>Visualização da distribuição de horários ocupados e disponíveis.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[350px]">
             <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={mockDailyOccupancyChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="Ocupados" fill="var(--color-Ocupados)" radius={4} />
                        <Bar dataKey="Disponíveis" fill="var(--color-Disponíveis)" radius={4} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Ocupação por Profissional</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
            {professionalOccupancy.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Agendamentos no Período</TableHead>
                            <TableHead className="text-right">Taxa de Ocupação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {professionalOccupancy.map(prof => (
                            <TableRow key={prof.id}>
                                <TableCell className="font-medium">{prof.name}</TableCell>
                                <TableCell className="text-right">{prof.appointments}</TableCell>
                                <TableCell className="text-right">{prof.rate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de ocupação por profissional disponível.</p>
            )}
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Placeholder: Relatório de Cancelamentos e Faltas</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Aqui seriam exibidos dados sobre cancelamentos, faltas, e motivos (se registrados).</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Placeholder: Relatório de Novos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Aqui seriam exibidos dados sobre novos clientes cadastrados por período.</p>
        </CardContent>
      </Card>
    </div>
  );
}
