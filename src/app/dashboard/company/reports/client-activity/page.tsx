
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Users, UserX, Mail, Filter, FileDown, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for client activity
const mockClientActivity = [
  { id: "clientA", name: "Ana Beatriz Lima", email: "ana.lima@example.com", phone: "(21) 99999-1111", lastAppointment: "2024-07-25", status: "Ativo" },
  { id: "clientB", name: "Bruno Carvalho", email: "bruno.c@example.com", phone: "(11) 98888-2222", lastAppointment: "2024-07-28", status: "Ativo" },
  { id: "clientC", name: "Carla Mendes", email: "carla.m@example.com", phone: "(31) 97777-3333", lastAppointment: "2024-05-10", status: "Inativo" },
  { id: "clientD", name: "Daniel Farias", email: "daniel.f@example.com", phone: "(41) 96666-4444", lastAppointment: "2024-04-01", status: "Inativo" },
  { id: "clientE", name: "Eduarda Gomes", email: "edu.gomes@example.com", phone: "(51) 95555-5555", lastAppointment: "2024-07-15", status: "Ativo" },
];

export default function ClientActivityReportPage() {
  const { toast } = useToast();
  const [clientActivityData, setClientActivityData] = useState(mockClientActivity);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90), // Default para últimos 90 dias para definir inatividade
    to: new Date(),
  });
  const [inactivityDays, setInactivityDays] = useState<number>(90);

  useEffect(() => {
    document.title = `Relatório de Atividade de Clientes - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de atividade de clientes seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de atividade de clientes:", { dateRange, inactivityDays });
    // Simular filtragem localmente para o mock
    const filtered = mockClientActivity.map(client => {
      const lastApptDate = parseISO(client.lastAppointment);
      const thresholdDate = subDays(new Date(), inactivityDays);
      return {
        ...client,
        status: lastApptDate >= thresholdDate ? "Ativo" : "Inativo",
      };
    });
    setClientActivityData(filtered);
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de atividade de clientes seria exportado como ${format.toUpperCase()}.`});
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
  
  const activeClients = clientActivityData.filter(c => c.status === "Ativo");
  const inactiveClients = clientActivityData.filter(c => c.status === "Inativo");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" /> Relatório de Atividade de Clientes
          </CardTitle>
          <CardDescription>Monitore clientes ativos e identifique clientes inativos para reengajamento.</CardDescription>
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
              <Label htmlFor="date-range-client-activity">Período do Último Agendamento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-client-activity" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="inactivity-days">Considerar Inativo Após (dias)</Label>
              <Input 
                id="inactivity-days" 
                type="number" 
                value={inactivityDays} 
                onChange={(e) => setInactivityDays(Number(e.target.value))} 
                className="mt-1"
                min="1"
              />
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
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-green-500"/> Clientes Ativos ({activeClients.length})</CardTitle>
              <CardDescription>Clientes com agendamentos dentro do período de atividade definido.</CardDescription>
          </CardHeader>
          <CardContent>
              {activeClients.length > 0 ? (
                  <Table>
                      <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Último Agend.</TableHead><TableHead>Contato</TableHead></TableRow></TableHeader>
                      <TableBody>
                          {activeClients.map(client => (
                              <TableRow key={client.id}>
                                  <TableCell className="font-medium">{client.name}</TableCell>
                                  <TableCell>{format(parseISO(client.lastAppointment), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                  <TableCell>{client.email}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ) : <p className="text-muted-foreground text-center py-8">Nenhum cliente ativo encontrado.</p>}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="text-xl flex items-center"><UserX className="mr-2 h-5 w-5 text-red-500"/> Clientes Inativos ({inactiveClients.length})</CardTitle>
              <CardDescription>Clientes sem agendamentos por mais de {inactivityDays} dias.</CardDescription>
          </CardHeader>
          <CardContent>
              {inactiveClients.length > 0 ? (
                  <Table>
                      <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Último Agend.</TableHead><TableHead>Contato</TableHead></TableRow></TableHeader>
                      <TableBody>
                          {inactiveClients.map(client => (
                              <TableRow key={client.id}>
                                  <TableCell className="font-medium">{client.name}</TableCell>
                                  <TableCell>{format(parseISO(client.lastAppointment), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                  <TableCell>{client.email}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ) : <p className="text-muted-foreground text-center py-8">Nenhum cliente inativo encontrado.</p>}
              {inactiveClients.length > 0 && (
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => toast({title: "Simulação", description: "Enviaria e-mails/mensagens para clientes inativos."})}>
                        <Mail className="mr-2 h-4 w-4"/> Enviar Lembrete de Reativação (Simulado)
                    </Button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
