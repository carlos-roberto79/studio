
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
import { ArrowLeft, Timer, Filter, FileDown, CalendarIcon, Users, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data
const mockProfessionalsFilter = [
    { id: "prof1", name: "Dr. João Dantas" },
    { id: "prof2", name: "Dra. Ana Souza" },
    { id: "prof3", name: "Carlos Estilista" },
];
const mockServicesFilter = [
    { id: "serv1", name: "Consulta Inicial" },
    { id: "serv2", name: "Limpeza de Pele" },
    { id: "serv3", name: "Corte Moderno" },
];

const mockAverageTimeData = [
  { id: "1", professionalName: "Dr. João Dantas", serviceName: "Consulta Inicial", estimatedTime: 60, actualTime: 55, difference: -5 },
  { id: "2", professionalName: "Dra. Ana Souza", serviceName: "Limpeza de Pele", estimatedTime: 75, actualTime: 80, difference: 5 },
  { id: "3", professionalName: "Carlos Estilista", serviceName: "Corte Moderno", estimatedTime: 45, actualTime: 45, difference: 0 },
  { id: "4", professionalName: "Dr. João Dantas", serviceName: "Acompanhamento", estimatedTime: 30, actualTime: 35, difference: 5 },
];

export default function AverageServiceTimeReportPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState(mockAverageTimeData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  useEffect(() => {
    document.title = `Relatório de Tempo Médio de Atendimento - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados do relatório seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de tempo médio:", { dateRange, selectedProfessional, selectedService });
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
  
  const overallAverageDifference = reportData.length > 0 
    ? (reportData.reduce((sum, item) => sum + item.difference, 0) / reportData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Timer className="mr-3 h-8 w-8 text-primary" /> Relatório de Tempo Médio de Atendimento
          </CardTitle>
          <CardDescription>Analise o tempo estimado vs. tempo real dos atendimentos.</CardDescription>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="date-range-avg-time">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-avg-time" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="professional-filter-avg-time">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-avg-time" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {mockProfessionalsFilter.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service-filter-avg-time">Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-filter-avg-time" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  {mockServicesFilter.map(serv => (
                    <SelectItem key={serv.id} value={serv.id}>{serv.name}</SelectItem>
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
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diferença Média Geral (Estimado vs. Real)</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{overallAverageDifference} min</div></CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalhamento do Tempo Médio por Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
            {reportData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead className="text-right">Tempo Estimado (min)</TableHead>
                            <TableHead className="text-right">Tempo Real (min)</TableHead>
                            <TableHead className="text-right">Diferença (min)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.professionalName}</TableCell>
                                <TableCell>{item.serviceName}</TableCell>
                                <TableCell className="text-right">{item.estimatedTime}</TableCell>
                                <TableCell className="text-right">{item.actualTime}</TableCell>
                                <TableCell className={`text-right font-semibold ${item.difference > 0 ? 'text-red-600' : item.difference < 0 ? 'text-green-600' : ''}`}>
                                    {item.difference > 0 ? `+${item.difference}` : item.difference}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado encontrado para o período e filtros selecionados.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

