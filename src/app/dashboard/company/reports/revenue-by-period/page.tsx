
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
import { ArrowLeft, LineChart, Filter, FileDown, CalendarIcon, Users, DollarSign, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for filters
const mockProfessionalsFilter = [
    { id: "prof1", name: "Dr. João Silva" },
    { id: "prof2", name: "Dra. Maria Oliveira" },
];
const mockServicesFilter = [
    { id: "serv1", name: "Consulta Geral" },
    { id: "serv2", name: "Limpeza Dental" },
];
const mockPaymentMethods = ["Todos", "Pix", "Cartão de Crédito", "Dinheiro", "Boleto"];

// Mock data for revenue
const mockRevenueData = {
  totalRevenue: 12550.75,
  transactions: 85,
  breakdown: [
    { item: "Pix", value: 4500.00, transactions: 30 },
    { item: "Cartão de Crédito", value: 6550.75, transactions: 40 },
    { item: "Dinheiro", value: 1500.00, transactions: 15 },
  ],
};

export default function RevenueByPeriodReportPage() {
  const { toast } = useToast();
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: endOfMonth(new Date())});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("this_month");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Todos");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");

  useEffect(() => {
    document.title = `Relatório de Faturamento por Período - ${APP_NAME}`;
  }, []);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const today = new Date();
    switch (period) {
      case "last_7_days":
        setDateRange({ from: subDays(today, 6), to: today });
        break;
      case "this_month":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case "last_month":
        const lastMonthStart = startOfMonth(subDays(today, today.getDate())); // Go to start of current month, then back one day to previous month, then start of that month
        setDateRange({ from: lastMonthStart, to: endOfMonth(lastMonthStart) });
        break;
      case "this_year":
        setDateRange({ from: startOfYear(today), to: endOfYear(today) });
        break;
      default:
        setDateRange(undefined); // For custom range via calendar
    }
  };

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados de faturamento seriam atualizados." });
    console.log("BACKEND_SIM: Aplicar filtros de faturamento:", { dateRange, selectedPeriod, selectedPaymentMethod, selectedProfessional, selectedService });
    // Em um app real, buscaria dados com base nos filtros e atualizaria mockRevenueData
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de faturamento seria exportado como ${format.toUpperCase()}.`});
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
            <LineChart className="mr-3 h-8 w-8 text-primary" /> Relatório de Faturamento por Período
          </CardTitle>
          <CardDescription>Analise a receita total em diferentes períodos e com filtros específicos.</CardDescription>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div>
              <Label htmlFor="period-select">Período Pré-definido</Label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger id="period-select" className="mt-1">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7_days">Últimos 7 dias</SelectItem>
                  <SelectItem value="this_month">Este Mês</SelectItem>
                  <SelectItem value="last_month">Mês Passado</SelectItem>
                  <SelectItem value="this_year">Este Ano</SelectItem>
                  <SelectItem value="custom">Personalizado (use o calendário)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-range-revenue">Período Personalizado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-revenue" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => { setDateRange(range); setSelectedPeriod("custom"); }}
                    defaultMonth={dateRange?.from instanceof Date && isValid(dateRange.from) ? dateRange.from : undefined}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="payment-method-filter">Forma de Pagamento</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="payment-method-filter" className="mt-1">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {mockPaymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="professional-filter-revenue">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-revenue" className="mt-1">
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
              <Label htmlFor="service-filter-revenue">Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-filter-revenue" className="mt-1">
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
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4"/> Aplicar Filtros
            </Button>
            <Button onClick={() => handleExport("excel")} className="w-full sm:w-auto"><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")} className="w-full sm:w-auto"><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total no Período</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">R$ {revenueData.totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{revenueData.transactions}</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Detalhamento do Faturamento (Mock)</CardTitle>
            <CardDescription>Valores agrupados por forma de pagamento neste período.</CardDescription>
        </CardHeader>
        <CardContent>
            {revenueData.breakdown.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Forma de Pagamento / Item</TableHead>
                            <TableHead className="text-right">Valor Total (R$)</TableHead>
                            <TableHead className="text-right">Nº Transações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {revenueData.breakdown.map(item => (
                            <TableRow key={item.item}>
                                <TableCell className="font-medium">{item.item}</TableCell>
                                <TableCell className="text-right">{item.value.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.transactions}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado de faturamento detalhado encontrado para o período.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

