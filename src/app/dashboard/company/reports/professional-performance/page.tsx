
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
import { ArrowLeft, Activity, Filter, FileDown, CalendarIcon, Users, DollarSign, Percent, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for professional performance
const mockProfessionalPerformance = [
  { id: "prof1", name: "João Dantas", appointments: 75, revenue: 7500, occupancyRate: "85%", cancellationRate: "5%" },
  { id: "prof2", name: "Dra. Ana Souza", appointments: 90, revenue: 10800, occupancyRate: "90%", cancellationRate: "2%" },
  { id: "prof3", name: "Dr. Carlos Lima", appointments: 60, revenue: 9000, occupancyRate: "70%", cancellationRate: "10%" },
];

export default function ProfessionalPerformanceReportPage() {
  const { toast } = useToast();
  const [performanceData, setPerformanceData] = useState(mockProfessionalPerformance);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    document.title = `Desempenho por Profissional - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados de desempenho por profissional seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de desempenho por profissional:", { dateRange });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de desempenho por profissional seria exportado como ${format.toUpperCase()}.`});
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
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Activity className="mr-3 h-8 w-8 text-primary" /> Relatório de Desempenho por Profissional
          </CardTitle>
          <CardDescription>Analise o desempenho individual e consolidado da sua equipe.</CardDescription>
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
              <Label htmlFor="date-range-prof-performance">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-prof-performance" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalhamento do Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
            {performanceData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Nº Atendimentos</TableHead>
                            <TableHead className="text-right">Faturamento (R$)</TableHead>
                            <TableHead className="text-right">Ocupação Média</TableHead>
                            <TableHead className="text-right">Taxa Cancelamento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {performanceData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center">
                                    <Users className="mr-2 h-4 w-4 text-muted-foreground"/>{item.name}
                                </TableCell>
                                <TableCell className="text-right">{item.appointments}</TableCell>
                                <TableCell className="text-right">{item.revenue.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <BarChart3 className="inline mr-1 h-4 w-4 text-blue-500"/>{item.occupancyRate}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Percent className="inline mr-1 h-4 w-4 text-red-500"/>{item.cancellationRate}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de desempenho encontrado.</p>
            )}
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Comparativo Gráfico (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-10">(Aqui seria exibido um gráfico comparando o desempenho dos profissionais em diferentes métricas.)</p>
        </CardContent>
      </Card>
    </div>
  );
}
