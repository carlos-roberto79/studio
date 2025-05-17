
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
import { ArrowLeft, CalendarX2, Filter, FileDown, CalendarIcon, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// Mock data for cancellations and no-shows
const mockCancellations = [
  { id: "cancel1", date: "2024-07-28", clientName: "Carlos Andrade", professionalName: "João Dantas", service: "Corte de Cabelo", type: "Cancelamento Cliente", reason: "Imprevisto pessoal" },
  { id: "cancel2", date: "2024-07-29", clientName: "Mariana Lima", professionalName: "Dra. Ana Souza", service: "Limpeza de Pele", type: "Falta (No-show)", reason: "-" },
  { id: "cancel3", date: "2024-07-30", clientName: "Pedro Martins", professionalName: "Dr. Carlos Lima", service: "Consulta Odontológica", type: "Cancelamento Profissional", reason: "Emergência do profissional" },
];

// Mock professionals and clients for filters
const mockProfessionalsFilter = [
    { id: "prof1", name: "João Dantas" },
    { id: "prof2", name: "Dra. Ana Souza" },
    { id: "prof3", name: "Dr. Carlos Lima" },
];
const mockClientsFilter = [
    { id: "client1", name: "Carlos Andrade" },
    { id: "client2", name: "Mariana Lima" },
    { id: "client3", name: "Pedro Martins" },
];

export default function CancellationsNoShowsReportPage() {
  const { toast } = useToast();
  const [cancellationsData, setCancellationsData] = useState(mockCancellations);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedClient, setSelectedClient] = useState<string>("");

  useEffect(() => {
    document.title = `Relatório de Cancelamentos e Faltas - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de cancelamentos e faltas seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros:", { dateRange, selectedProfessional, selectedClient });
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <CalendarX2 className="mr-3 h-8 w-8 text-primary" /> Relatório de Cancelamentos e Faltas
          </CardTitle>
          <CardDescription>Analise os cancelamentos e faltas (no-shows) para otimizar sua agenda.</CardDescription>
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
              <Label htmlFor="date-range-cancellations">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-cancellations" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="professional-filter-cancellations">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-cancellations" className="mt-1">
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
              <Label htmlFor="client-filter-cancellations">Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger id="client-filter-cancellations" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {mockClientsFilter.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
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
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Cancelamento Geral (Mock)</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">8%</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Faltas (No-Show) (Mock)</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">3%</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Lista de Cancelamentos e Faltas</CardTitle>
        </CardHeader>
        <CardContent>
            {cancellationsData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Motivo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cancellationsData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{format(parseISO(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                <TableCell className="font-medium">{item.clientName}</TableCell>
                                <TableCell>{item.professionalName}</TableCell>
                                <TableCell>{item.service}</TableCell>
                                <TableCell>
                                    <Badge variant={item.type.includes("Falta") ? "destructive" : "outline"}>
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.reason}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum cancelamento ou falta registrada no período.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

