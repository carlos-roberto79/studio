
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
import { ArrowLeft, DollarSign, Filter, FileDown, CalendarIcon, Users, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for revenue by professional
const mockRevenueByProfessional = [
  { id: "prof1", name: "João Dantas", totalRevenue: 7500, appointments: 50, cancellationRate: "5%" },
  { id: "prof2", name: "Dra. Ana Souza", totalRevenue: 9200, appointments: 65, cancellationRate: "2%" },
  { id: "prof3", name: "Dr. Carlos Lima", totalRevenue: 4800, appointments: 35, cancellationRate: "10%" },
];

export default function RevenueByProfessionalReportPage() {
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState(mockRevenueByProfessional);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    document.title = `Faturamento por Profissional - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados de faturamento por profissional seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de faturamento por profissional:", { dateRange });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de faturamento por profissional seria exportado como ${format.toUpperCase()}.`});
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
            <DollarSign className="mr-3 h-8 w-8 text-primary" /> Relatório de Faturamento por Profissional
          </CardTitle>
          <CardDescription>Analise a receita gerada por cada profissional.</CardDescription>
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
              <Label htmlFor="date-range-revenue-prof">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-revenue-prof" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
            <CardTitle>Detalhamento do Faturamento por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
            {revenueData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Receita Gerada (R$)</TableHead>
                            <TableHead className="text-right">Qtd. Atendimentos</TableHead>
                            <TableHead className="text-right">Taxa de Cancelamento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {revenueData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium flex items-center">
                                    <Users className="mr-2 h-4 w-4 text-muted-foreground"/>{item.name}
                                </TableCell>
                                <TableCell className="text-right">{item.totalRevenue.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.appointments}</TableCell>
                                <TableCell className="text-right flex items-center justify-end">
                                    <TrendingDown className="mr-1 h-4 w-4 text-red-500"/>{item.cancellationRate}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de faturamento por profissional encontrado.</p>
            )}
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Gráfico de Receita por Profissional (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-10">(Aqui seria exibido um gráfico de barras comparando a receita de diferentes profissionais.)</p>
        </CardContent>
      </Card>
    </div>
  );
}


    