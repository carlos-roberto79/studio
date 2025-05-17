
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
import { ArrowLeft, Award, Filter, FileDown, CalendarIcon, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for professional ranking
const mockProfessionalRanking = [
  { rank: 1, id: "prof2", name: "Dra. Ana Souza", appointments: 65, revenue: 9200 },
  { rank: 2, id: "prof1", name: "João Dantas", appointments: 50, revenue: 7500 },
  { rank: 3, id: "prof3", name: "Dr. Carlos Lima", appointments: 35, revenue: 4800 },
];

export default function ProfessionalRankingReportPage() {
  const { toast } = useToast();
  const [rankingData, setRankingData] = useState(mockProfessionalRanking);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    document.title = `Ranking de Profissionais - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "O ranking de profissionais seria atualizado." });
    console.log("BACKEND_SIM: Aplicar filtros de ranking:", { dateRange });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de ranking seria exportado como ${format.toUpperCase()}.`});
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
            <Award className="mr-3 h-8 w-8 text-primary" /> Relatório de Ranking de Profissionais por Demanda
          </CardTitle>
          <CardDescription>Identifique os profissionais mais solicitados com base no volume de agendamentos.</CardDescription>
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
              <Label htmlFor="date-range-prof-ranking">Período de Análise</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-prof-ranking" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profissional Mais Demandado (Mock)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{rankingData.length > 0 ? rankingData[0].name : "N/A"}</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agendamentos (Todos Prof.) (Mock)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{rankingData.reduce((sum, p) => sum + p.appointments, 0)}</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Ranking de Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
            {rankingData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Rank</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead className="text-right">Total Agendamentos</TableHead>
                            <TableHead className="text-right">Receita Gerada (R$)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankingData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center font-bold">{item.rank}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.appointments}</TableCell>
                                <TableCell className="text-right">{item.revenue.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de ranking encontrado.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}


    