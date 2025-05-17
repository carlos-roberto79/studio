
"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, BarChartBig, Filter, FileDown, CalendarIcon, Palette, Activity, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from '@/components/ui/badge';

interface CompanyUsageData {
  id: string;
  name: string;
  plan: "Básico" | "Pro" | "Empresarial";
  customizationActive: boolean;
  themeUsed: string; // e.g., "Padrão Sistema", "Tema Moderno Azul"
  layoutUsed: string; // e.g., "Padrão", "Compacto"
  loginsPeriod: number;
  appointmentsPeriod: number;
  lastActivity: string; // Date string
}

const mockCompanyUsageData: CompanyUsageData[] = [
  { id: "comp1", name: "Salão Cortes Modernos", plan: "Pro", customizationActive: true, themeUsed: "Azul Elegante", layoutUsed: "Moderno", loginsPeriod: 150, appointmentsPeriod: 280, lastActivity: "2024-08-01" },
  { id: "comp2", name: "Clínica Sorriso Feliz", plan: "Básico", customizationActive: false, themeUsed: "Padrão Sistema", layoutUsed: "Padrão", loginsPeriod: 80, appointmentsPeriod: 120, lastActivity: "2024-07-28" },
  { id: "comp3", name: "Academia Corpo em Movimento", plan: "Empresarial", customizationActive: true, themeUsed: "Energia Vibrante", layoutUsed: "Compacto", loginsPeriod: 250, appointmentsPeriod: 450, lastActivity: "2024-08-02" },
  { id: "comp4", name: "Consultoria Mentes Brilhantes", plan: "Pro", customizationActive: false, themeUsed: "Padrão Sistema", layoutUsed: "Padrão", loginsPeriod: 120, appointmentsPeriod: 90, lastActivity: "2024-07-30" },
];

export default function CustomizationUsageReportPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState(mockCompanyUsageData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = `Relatório de Uso e Personalização - Painel Site Admin - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "Os dados do relatório seriam atualizados." });
    // Simulate filtering based on searchTerm for mock data
    const filtered = mockCompanyUsageData.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setReportData(filtered);
    console.log("BACKEND_SIM (SITE_ADMIN): Aplicar filtros de uso e personalização:", { dateRange, searchTerm });
  };
  
  const handleExport = (format: "pdf" | "excel") => {
    toast({ title: "Exportação Iniciada (Simulação)", description: `O relatório de uso e personalização seria exportado como ${format.toUpperCase()}.`});
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
  
  const filteredReportData = reportData.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <BarChartBig className="mr-3 h-8 w-8 text-primary" /> Relatório de Uso e Personalização
          </CardTitle>
          <CardDescription>Analise como as empresas utilizam o sistema e aplicam personalizações.</CardDescription>
        </CardHeader>
        {/* O botão de voltar pode não ser necessário se a navegação for pela sidebar */}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5"/> Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range-usage">Período de Análise</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-usage" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="search-company-usage">Buscar Empresa</Label>
              <div className="flex items-center mt-1">
                <Input 
                  id="search-company-usage"
                  placeholder="Nome da empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleApplyFilters} variant="ghost" size="icon" className="ml-2">
                    <Search className="h-5 w-5"/>
                </Button>
              </div>
            </div>
            {/* Placeholder para outros filtros, como tipo de plano */}
          </div>
           <div className="flex justify-end space-x-3 pt-2">
            <Button onClick={() => handleExport("excel")}><FileDown className="mr-2 h-4 w-4"/> Exportar Excel</Button>
            <Button onClick={() => handleExport("pdf")}><FileDown className="mr-2 h-4 w-4"/> Exportar PDF</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Dados de Uso e Personalização por Empresa</CardTitle>
        </CardHeader>
        <CardContent>
            {filteredReportData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Personalização Ativa?</TableHead>
                            <TableHead>Tema</TableHead>
                            <TableHead>Layout</TableHead>
                            <TableHead className="text-right">Logins</TableHead>
                            <TableHead className="text-right">Agendamentos</TableHead>
                            <TableHead>Última Atividade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReportData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell><Badge variant="secondary">{item.plan}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={item.customizationActive ? "default" : "outline"}
                                           className={item.customizationActive ? "bg-green-500 hover:bg-green-600" : ""}>
                                        {item.customizationActive ? "Sim" : "Não"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.themeUsed}</TableCell>
                                <TableCell>{item.layoutUsed}</TableCell>
                                <TableCell className="text-right">{item.loginsPeriod}</TableCell>
                                <TableCell className="text-right">{item.appointmentsPeriod}</TableCell>
                                <TableCell>{format(parseISO(item.lastActivity), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum dado encontrado para os filtros selecionados.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

