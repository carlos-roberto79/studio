
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
import { ArrowLeft, UserPlus, Filter, FileDown, CalendarIcon, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for new clients
const mockNewClients = [
  { id: "clientA", name: "Ana Beatriz Lima", registrationDate: "2024-07-01", source: "Indicação", firstService: "Consulta Psicológica Online" },
  { id: "clientB", name: "Bruno Carvalho", registrationDate: "2024-07-05", source: "Google", firstService: "Corte de Cabelo Masculino" },
  { id: "clientC", name: "Carla Mendes", registrationDate: "2024-07-10", source: "Instagram", firstService: "Manicure e Pedicure Completa" },
  { id: "clientD", name: "Daniel Farias", registrationDate: "2024-06-15", source: "Facebook", firstService: "Corte de Cabelo Masculino" },
];

export default function NewClientsReportPage() {
  const { toast } = useToast();
  const [newClientsData, setNewClientsData] = useState(mockNewClients);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    to: new Date(), // Hoje
  });

  useEffect(() => {
    document.title = `Relatório de Novos Clientes - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de novos clientes seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de novos clientes:", { dateRange });
    // Em um app real, buscaria dados com base nos filtros
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de novos clientes seria exportado como ${format.toUpperCase()}.`});
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
  
  // Simula a contagem de novos clientes baseado no filtro de data (apenas para o mock)
  const filteredNewClientsCount = newClientsData.filter(client => {
    const regDate = parseISO(client.registrationDate);
    const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
    const toDate = dateRange?.to ? new Date(dateRange.to) : null;
    if (fromDate && toDate) {
      return regDate >= fromDate && regDate <= toDate;
    }
    return true; // Se não houver filtro de data, mostra todos para o count
  }).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <UserPlus className="mr-3 h-8 w-8 text-primary" /> Relatório de Novos Clientes
          </CardTitle>
          <CardDescription>Acompanhe a aquisição de novos clientes e suas origens.</CardDescription>
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
              <Label htmlFor="date-range-new-clients">Período de Cadastro</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-new-clients" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
                <CardTitle className="text-sm font-medium">Total de Novos Clientes no Período</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{filteredNewClientsCount}</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão (Placeholder)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">15%</div><p className="text-xs text-muted-foreground">de visitantes para clientes</p></CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Lista de Novos Clientes</CardTitle>
            <CardDescription>Clientes cadastrados no período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
            {newClientsData.filter(client => { // Filtra para exibição na tabela
                const regDate = parseISO(client.registrationDate);
                const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
                const toDate = dateRange?.to ? new Date(dateRange.to) : null;
                 if (!fromDate || !toDate) return true; // Se não houver data, não filtra
                return regDate >= fromDate && regDate <= toDate;
            }).length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome do Cliente</TableHead>
                            <TableHead>Data de Cadastro</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Primeiro Serviço Agendado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {newClientsData.filter(client => {
                             const regDate = parseISO(client.registrationDate);
                             const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
                             const toDate = dateRange?.to ? new Date(dateRange.to) : null;
                             if (!fromDate || !toDate) return true;
                             return regDate >= fromDate && regDate <= toDate;
                        }).map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell>{format(parseISO(client.registrationDate), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                <TableCell>{client.source}</TableCell>
                                <TableCell>{client.firstService}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum novo cliente encontrado para o período selecionado.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

