
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, CreditCard, DollarSign, FileDown, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";


// Mock data for payments
const mockPayments = [
  { id: "1", clientName: "Carlos Andrade", service: "Corte de Cabelo", professional: "João Dantas", dateTime: "2024-07-28 10:00", totalValue: 50.00, bookingFee: 5.00, commission: 10.00, paymentMethod: "Cartão de Crédito", status: "Pago" },
  { id: "2", clientName: "Mariana Lima", service: "Limpeza de Pele", professional: "Dra. Ana Souza", dateTime: "2024-07-29 14:30", totalValue: 120.00, bookingFee: 0.00, commission: 25.00, paymentMethod: "Pix", status: "Pago" },
  { id: "3", clientName: "Pedro Martins", service: "Consulta Odontológica", professional: "Dr. Carlos Lima", dateTime: "2024-07-30 09:00", totalValue: 150.00, bookingFee: 15.00, commission: 30.00, paymentMethod: "Boleto", status: "Pendente" },
  { id: "4", clientName: "Sofia Bernardes", service: "Manicure", professional: "Laura Mendes", dateTime: "2024-07-30 11:00", totalValue: 35.00, bookingFee: 0.00, commission: 5.00, paymentMethod: "Cartão de Débito", status: "Pago" },
  { id: "5", clientName: "Rafael Moreira", service: "Massagem Relaxante", professional: "Bruno Alves", dateTime: "2024-07-31 16:00", totalValue: 90.00, bookingFee: 10.00, commission: 18.00, paymentMethod: "Pix", status: "Reembolsado" },
];

// Mock professionals for filter
const mockProfessionals = [
    { id: "prof1", name: "João Dantas" },
    { id: "prof2", name: "Dra. Ana Souza" },
    { id: "prof3", name: "Dr. Carlos Lima" },
    { id: "prof4", name: "Laura Mendes" },
    { id: "prof5", name: "Bruno Alves" },
];

export default function CompanyFinancialsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState(mockPayments);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    document.title = `Painel Financeiro - ${APP_NAME}`;
    // In a real app, fetch payments data here
  }, []);
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `Seus dados financeiros seriam exportados em formato ${format.toUpperCase()}.` });
    console.log("BACKEND_SIM: Exportar dados financeiros como", format, {dateRange, selectedProfessional, selectedPaymentMethod, selectedStatus});
  }

  const applyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: `A lista de pagamentos seria atualizada com os filtros selecionados.` });
     console.log("BACKEND_SIM: Aplicar filtros:", {dateRange, selectedProfessional, selectedPaymentMethod, selectedStatus});
    // Aqui, em uma aplicação real, você faria uma nova busca de dados com os filtros
  }

 const displayDateRange = () => {
    const { from, to } = dateRange || {};
    let fromDate = from;
    let toDate = to;

    if (typeof from === 'string') fromDate = parseISO(from);
    if (typeof to === 'string') toDate = parseISO(to);

    if (fromDate && isValid(fromDate)) {
      const fromFormatted = format(fromDate, "dd/MM/yy", { locale: ptBR });
      if (toDate && isValid(toDate)) {
        const toFormatted = format(toDate, "dd/MM/yy", { locale: ptBR });
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
            <DollarSign className="mr-3 h-8 w-8 text-primary" /> Painel Financeiro
          </CardTitle>
          <CardDescription>Acompanhe os pagamentos, taxas e comissões da sua empresa.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5"/> Filtros e Exportação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-range">Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    {displayDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from instanceof Date && isValid(dateRange.from) ? dateRange.from : undefined}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="professional-filter">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter" className="mt-1">
                  <SelectValue placeholder="Todos os Profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Profissionais</SelectItem>
                  {mockProfessionals.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-method-filter">Forma de Pagamento</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger id="payment-method-filter" className="mt-1">
                  <SelectValue placeholder="Todas as Formas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Formas</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro (Presencial)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status do Pagamento</Label>
               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-filter" className="mt-1">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Reembolsado">Reembolsado</SelectItem>
                  <SelectItem value="Falhou">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={applyFilters}><Filter className="mr-2 h-4 w-4"/> Aplicar Filtros</Button>
            <Button onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
            <Button onClick={() => handleExport("excel")}><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><CreditCard className="mr-2 h-5 w-5"/> Listagem de Pagamentos</CardTitle>
          <CardDescription>Pagamentos recebidos por agendamentos na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="text-right">Total (R$)</TableHead>
                  <TableHead className="text-right">Taxa Ag. (R$)</TableHead>
                  <TableHead className="text-right">Comissão (R$)</TableHead>
                  <TableHead>Forma Pgto.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.clientName}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>{payment.professional}</TableCell>
                    <TableCell>{payment.dateTime}</TableCell>
                    <TableCell className="text-right">{payment.totalValue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{payment.bookingFee.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{payment.commission.toFixed(2)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        payment.status === "Pago" ? "bg-green-100 text-green-700" :
                        payment.status === "Pendente" ? "bg-yellow-100 text-yellow-700" :
                        payment.status === "Reembolsado" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700" // Falhou ou outros
                      }`}>
                        {payment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum pagamento encontrado.</p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Integração com Pagamento Online</CardTitle>
            <CardDescription>
                Na finalização do agendamento, o cliente poderá optar por pagamento online.
                Pagamentos confirmados automaticamente desbloqueariam o horário na agenda.
                (Esta é uma simulação de como a funcionalidade seria descrita. A integração real requer backend).
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Aqui seriam exibidas configurações do gateway de pagamento (Stripe, Mercado Pago, etc.)
                e o status da integração.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
