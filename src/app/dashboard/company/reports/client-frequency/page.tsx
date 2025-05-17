
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Repeat, Filter, FileDown, CalendarIcon, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for client frequency
const mockClientFrequency = [
  { id: "clientA", name: "Ana Beatriz Lima", appointmentsCount: 5, totalSpent: 600.00, lastAppointmentDate: "2024-07-25" },
  { id: "clientB", name: "Bruno Carvalho", appointmentsCount: 2, totalSpent: 150.00, lastAppointmentDate: "2024-07-28" },
  { id: "clientC", name: "Carla Mendes", appointmentsCount: 8, totalSpent: 950.00, lastAppointmentDate: "2024-07-10" },
  { id: "clientD", name: "Daniel Farias", appointmentsCount: 1, totalSpent: 80.00, lastAppointmentDate: "2024-06-01" },
];

export default function ClientFrequencyReportPage() {
  const { toast } = useToast();
  const [frequencyData, setFrequencyData] = useState(mockClientFrequency);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });

  useEffect(() => {
    document.title = `Relatório de Frequência de Clientes - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de frequência de clientes seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de frequência:", { dateRange });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório seria exportado como ${format.toUpperCase()}.`});
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
  
  const averageAppointments = frequencyData.length > 0 
    ? (frequencyData.reduce((sum, client) => sum + client.appointmentsCount, 0) / frequencyData.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Repeat className="mr-3 h-8 w-8 text-primary" /> Relatório de Frequência de Clientes
          </CardTitle>
          <CardDescription>Analise a recorrência dos seus clientes e o valor que eles trazem.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5"/> Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="date-range-frequency">Período de Análise</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-frequency" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
            <div className="flex items-end">
                <Button onClick={handleApplyFilters} className="w-full mt-1 md:mt-0">
                    <Filter className="mr-2 h-4 w-4"/> Aplicar Filtros
                </Button>
            </div>
          </div>
           <div className="flex justify-end space-x-3 pt-2">
            <Button onClick={() => handleExport("excel")}><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Agendamentos por Cliente (no período)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{averageAppointments}</div></CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalhamento da Frequência por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
            {frequencyData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Nº Agendamentos</TableHead>
                            <TableHead className="text-right">Valor Total Gasto (R$)</TableHead>
                            <TableHead>Último Agendamento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {frequencyData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.appointmentsCount}</TableCell>
                                <TableCell className="text-right">{item.totalSpent.toFixed(2)}</TableCell>
                                <TableCell>{format(parseISO(item.lastAppointmentDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de frequência encontrado para o período.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
