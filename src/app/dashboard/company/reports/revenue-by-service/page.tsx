
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
import { ArrowLeft, TrendingUp, Filter, FileDown, CalendarIcon, PieChart as PieChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";

// Mock data for revenue by service
const mockRevenueByService = [
  { id: "serv1", name: "Corte de Cabelo Masculino", totalRevenue: 5000, contribution: 0.30 },
  { id: "serv2", name: "Consulta Psicológica Online", totalRevenue: 8000, contribution: 0.48 },
  { id: "serv3", name: "Manicure e Pedicure Completa", totalRevenue: 3750, contribution: 0.22 },
];

// Mock services for filter
const mockServicesFilter = [
    { id: "serv1", name: "Corte de Cabelo Masculino" },
    { id: "serv2", name: "Consulta Psicológica Online" },
    { id: "serv3", name: "Manicure e Pedicure Completa" },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function RevenueByServiceReportPage() {
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState(mockRevenueByService);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedService, setSelectedService] = useState<string>("");

  useEffect(() => {
    document.title = `Faturamento por Serviço - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados de faturamento por serviço seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de faturamento por serviço:", { dateRange, selectedService });
    // Em um app real, buscaria dados com base nos filtros
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de faturamento por serviço seria exportado como ${format.toUpperCase()}.`});
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

  const pieChartData = revenueData.map(item => ({ name: item.name, value: item.totalRevenue }));


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <TrendingUp className="mr-3 h-8 w-8 text-primary" /> Relatório de Faturamento por Serviço
          </CardTitle>
          <CardDescription>Analise a receita gerada por cada tipo de serviço oferecido.</CardDescription>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range-revenue-service">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-revenue-service" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="service-filter-revenue">Serviço Específico (Opcional)</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-filter-revenue" className="mt-1">
                  <SelectValue placeholder="Todos os Serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  {mockServicesFilter.map(service => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
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
           <div className="flex justify-end space-x-3 pt-2">
            <Button onClick={() => handleExport("excel")}><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-xl flex items-center"><PieChartIcon className="mr-2 h-5 w-5"/> Distribuição de Receita por Serviço</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ChartContainer config={{}} className="w-full h-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                        <RechartsLegend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-1">
            <CardHeader>
                <CardTitle>Detalhamento do Faturamento por Serviço</CardTitle>
            </CardHeader>
            <CardContent>
                {revenueData.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serviço</TableHead>
                                <TableHead className="text-right">Receita Total (R$)</TableHead>
                                <TableHead className="text-right">Contribuição (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {revenueData.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.totalRevenue.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{(item.contribution * 100).toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-center py-8">Nenhum dado de faturamento por serviço encontrado.</p>
                )}
            </CardContent>
        </Card>
      </div>

       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Comparativo Entre Serviços (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Aqui seria exibido um gráfico de barras comparando o faturamento de diferentes serviços ao longo do tempo.</p>
        </CardContent>
      </Card>
    </div>
  );
}

