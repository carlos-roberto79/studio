
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
import { ArrowLeft, Package, Filter, FileDown, CalendarIcon, BarChart3 as BarChartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";

// Mock data for top services
const mockTopServices = [
  { id: "serv1", name: "Consulta Psicológica Online", volume: 120, revenue: 14400 },
  { id: "serv2", name: "Corte de Cabelo Masculino", volume: 95, revenue: 4750 },
  { id: "serv3", name: "Manicure e Pedicure Completa", volume: 80, revenue: 6000 },
  { id: "serv4", name: "Limpeza de Pele Profunda", volume: 50, revenue: 7500 },
];

const chartConfig = {
  volume: { label: "Volume", color: "hsl(var(--chart-1))" },
  revenue: { label: "Receita (R$)", color: "hsl(var(--chart-2))" },
} satisfies Parameters<typeof ChartContainer>[0]["config"];


export default function TopServicesReportPage() {
  const { toast } = useToast();
  const [topServicesData, setTopServicesData] = useState(mockTopServices);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [chartMetric, setChartMetric] = useState<"volume" | "revenue">("volume");

  useEffect(() => {
    document.title = `Serviços Mais Populares - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados dos serviços mais populares seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de serviços populares:", { dateRange });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de serviços mais populares seria exportado como ${format.toUpperCase()}.`});
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

  const chartData = topServicesData.map(service => ({
    name: service.name.length > 20 ? service.name.substring(0, 17) + "..." : service.name,
    volume: service.volume,
    revenue: service.revenue,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Package className="mr-3 h-8 w-8 text-primary" /> Relatório de Serviços Mais Populares
          </CardTitle>
          <CardDescription>Analise quais serviços têm maior volume de agendamentos e geram mais receita.</CardDescription>
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
              <Label htmlFor="date-range-top-services">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-top-services" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
            <CardTitle className="text-xl flex items-center"><BarChartIcon className="mr-2 h-5 w-5"/> Visualização Gráfica</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
                <Label className="text-sm">Métrica do Gráfico:</Label>
                <Button variant={chartMetric === 'volume' ? 'default' : 'outline'} size="sm" onClick={() => setChartMetric('volume')}>Volume</Button>
                <Button variant={chartMetric === 'revenue' ? 'default' : 'outline'} size="sm" onClick={() => setChartMetric('revenue')}>Receita</Button>
            </div>
        </CardHeader>
        <CardContent className="h-[400px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" dataKey={chartMetric} />
                        <YAxis dataKey="name" type="category" width={80} interval={0} />
                        <RechartsTooltip 
                            formatter={(value) => chartMetric === 'revenue' ? `R$ ${Number(value).toFixed(2)}` : value}
                        />
                        <RechartsLegend />
                        <Bar dataKey={chartMetric} fill={`var(--color-${chartMetric})`} radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Ranking de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
            {topServicesData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serviço</TableHead>
                            <TableHead className="text-right">Volume de Agendamentos</TableHead>
                            <TableHead className="text-right">Receita Gerada (R$)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topServicesData.sort((a,b) => chartMetric === 'revenue' ? b.revenue - a.revenue : b.volume - a.volume).map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.volume}</TableCell>
                                <TableCell className="text-right">{item.revenue.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de serviço encontrado.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


    