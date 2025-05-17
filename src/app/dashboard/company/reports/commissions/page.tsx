
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
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, FileSpreadsheet, Filter, Printer, FileDown, CalendarIcon, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from '@/components/ui/badge';

// Mock data for commissions report
const mockCommissions = [
  { id: "comm1", professionalName: "João Dantas", period: "Julho/2024", totalBilled: 3500, commissionBase: 3000, commissionType: "10%", commissionValue: 300, paymentStatus: "Pendente" },
  { id: "comm2", professionalName: "Dra. Ana Souza", period: "Julho/2024", totalBilled: 5200, commissionBase: 5000, commissionType: "R$ 50/serv.", commissionValue: 450, paymentStatus: "Pago" },
  { id: "comm3", professionalName: "Dr. Carlos Lima", period: "Julho/2024", totalBilled: 2800, commissionBase: 2800, commissionType: "15%", commissionValue: 420, paymentStatus: "Pendente" },
  { id: "comm4", professionalName: "João Dantas", period: "Junho/2024", totalBilled: 3200, commissionBase: 3000, commissionType: "10%", commissionValue: 300, paymentStatus: "Pago" },
];

// Mock professionals for filter
const mockProfessionalsFilter = [
    { id: "prof1", name: "João Dantas" },
    { id: "prof2", name: "Dra. Ana Souza" },
    { id: "prof3", name: "Dr. Carlos Lima" },
];

export default function CommissionsReportPage() {
  const { toast } = useToast();
  const [commissions, setCommissions] = useState(mockCommissions);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    document.title = `Relatório de Comissões - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de comissões seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de comissões:", { dateRange, selectedProfessional, selectedStatus });
    // Em um app real, buscaria dados com base nos filtros
  };

  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de comissões seria exportado como ${format.toUpperCase()}.`});
  };

  const handlePayCommission = (commissionId: string) => {
    toast({ title: "Pagamento Simulado", description: `A comissão ID ${commissionId} seria marcada como paga.`});
    // Lógica para atualizar o status no mock ou chamar API
    setCommissions(prev => prev.map(c => c.id === commissionId ? {...c, paymentStatus: "Pago"} : c));
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
            <FileSpreadsheet className="mr-3 h-8 w-8 text-primary" /> Relatório de Comissões
          </CardTitle>
          <CardDescription>Acompanhe e gerencie as comissões dos seus profissionais.</CardDescription>
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
              <Label htmlFor="date-range-comm">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-comm" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="professional-filter-comm">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-comm" className="mt-1">
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
              <Label htmlFor="status-filter-comm">Status Pagamento Comissão</Label>
               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-filter-comm" className="mt-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap justify-end space-x-0 sm:space-x-3 space-y-2 sm:space-y-0 pt-2">
            <Button variant="outline" onClick={handleApplyFilters}><Filter className="mr-2 h-4 w-4"/> Aplicar Filtros</Button>
            <Button variant="outline" onClick={() => alert("Simulação: Gerar Recibo/Comprovante")}><Printer className="mr-2 h-4 w-4"/> Gerar Recibo (Simulado)</Button>
            <Button onClick={() => handleExport("excel")}><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Comissões Calculadas</CardTitle>
        </CardHeader>
        <CardContent>
            {commissions.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Total Faturado (R$)</TableHead>
                            <TableHead className="text-right">Base Comissão (R$)</TableHead>
                            <TableHead>Tipo Comissão</TableHead>
                            <TableHead className="text-right">Valor Comissão (R$)</TableHead>
                            <TableHead>Status Pagamento</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {commissions.map(comm => (
                            <TableRow key={comm.id}>
                                <TableCell className="font-medium">{comm.professionalName}</TableCell>
                                <TableCell>{comm.period}</TableCell>
                                <TableCell className="text-right">{comm.totalBilled.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{comm.commissionBase.toFixed(2)}</TableCell>
                                <TableCell>{comm.commissionType}</TableCell>
                                <TableCell className="text-right">{comm.commissionValue.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={comm.paymentStatus === "Pago" ? "default" : "outline"}
                                           className={comm.paymentStatus === "Pago" ? "bg-green-500 hover:bg-green-600" : "border-yellow-500 text-yellow-600"}>
                                        {comm.paymentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {comm.paymentStatus === "Pendente" && (
                                        <Button size="sm" onClick={() => handlePayCommission(comm.id)}>
                                            <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Pago
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma comissão encontrada com os filtros selecionados.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
