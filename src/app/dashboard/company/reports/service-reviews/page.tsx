
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
import { ArrowLeft, Star, Filter, FileDown, CalendarIcon, Users, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// Mock data for service reviews/notes
const mockServiceReviews = [
  { id: "rev1", date: "2024-07-28", clientName: "Ana Silva", professionalName: "Dr. João Dantas", serviceName: "Consulta Inicial", rating: 9, noteTitle: "Primeira impressão positiva" },
  { id: "rev2", date: "2024-07-29", clientName: "Bruno Costa", professionalName: "Dra. Ana Souza", serviceName: "Limpeza de Pele", rating: 7, noteTitle: "Pele melhor, mas esperava mais" },
  { id: "rev3", date: "2024-07-30", clientName: "Carla Lima", professionalName: "Dr. João Dantas", serviceName: "Acompanhamento", rating: 10, noteTitle: "Excelente progresso!" },
  { id: "rev4", date: "2024-07-30", clientName: "Daniel Farias", professionalName: "Carlos Estilista", serviceName: "Corte Moderno", rating: 8, noteTitle: "Gostei do corte" },
];

// Mock professionals and services for filters
const mockProfessionalsFilter = [
    { id: "prof1", name: "Dr. João Dantas" },
    { id: "prof2", name: "Dra. Ana Souza" },
    { id: "prof3", name: "Carlos Estilista" },
];
const mockServicesFilter = [
    { id: "serv1", name: "Consulta Inicial" },
    { id: "serv2", name: "Limpeza de Pele" },
    { id: "serv3", name: "Acompanhamento" },
    { id: "serv4", name: "Corte Moderno" },
];

export default function ServiceReviewsReportPage() {
  const { toast } = useToast();
  const [reviewsData, setReviewsData] = useState(mockServiceReviews);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  useEffect(() => {
    document.title = `Relatório de Avaliações - ${APP_NAME}`;
  }, []);

  const handleApplyFilters = () => {
    toast({ title: "Filtros Aplicados (Simulação)", description: "A lista de avaliações seria atualizada." });
    console.log("BACKEND_SIM: Aplicar filtros de avaliações:", { dateRange, selectedProfessional, selectedService });
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

  const averageRating = reviewsData.length > 0 
    ? (reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length).toFixed(1) 
    : "N/A";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Star className="mr-3 h-8 w-8 text-primary" /> Relatório de Avaliações e Notas
          </CardTitle>
          <CardDescription>Analise o feedback dos clientes e as notas dos atendimentos.</CardDescription>
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
              <Label htmlFor="date-range-reviews">Período da Avaliação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date-range-reviews" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
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
              <Label htmlFor="professional-filter-reviews">Profissional</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional-filter-reviews" className="mt-1">
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
              <Label htmlFor="service-filter-reviews">Serviço</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-filter-reviews" className="mt-1">
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
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral de Notas</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{averageRating}/10</div></CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações no Período</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{reviewsData.length}</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Lista de Avaliações e Notas</CardTitle>
            <CardDescription>Notas e títulos de anotações dos atendimentos (se registradas pelo profissional).</CardDescription>
        </CardHeader>
        <CardContent>
            {reviewsData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead className="text-center">Nota (1-10)</TableHead>
                            <TableHead>Título/Comentário</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewsData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{format(parseISO(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                <TableCell className="font-medium">{item.clientName}</TableCell>
                                <TableCell>{item.professionalName}</TableCell>
                                <TableCell>{item.serviceName}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={item.rating >= 8 ? "default" : item.rating >= 5 ? "secondary" : "destructive"}
                                           className={item.rating >= 8 ? "bg-green-500 hover:bg-green-600" : item.rating >=5 ? "bg-yellow-400 text-black hover:bg-yellow-500" : ""}>
                                        {item.rating}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.noteTitle}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma avaliação ou nota encontrada no período selecionado.</p>
            )}
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Gráfico de Distribuição de Notas (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-10">(Aqui seria exibido um gráfico mostrando quantas notas de cada valor foram dadas, por exemplo, um gráfico de barras).</p>
        </CardContent>
      </Card>
    </div>
  );
}


    