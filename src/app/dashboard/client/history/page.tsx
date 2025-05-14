
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';
import Link from "next/link";
import { ArrowLeft, HistoryIcon } from "lucide-react"; // Changed History to HistoryIcon as it's more specific
import Image from "next/image";

// Mock data for past appointments
const pastAppointments = [
  { id: "1", date: "15 de Junho de 2024", time: "10:00", service: "Corte de Cabelo", professional: "João Dantas", company: "Salão Cortes Modernos", status: "Concluído", companyLogo: "https://placehold.co/40x40.png?text=CM" },
  { id: "2", date: "01 de Junho de 2024", time: "15:30", service: "Limpeza de Pele", professional: "Dra. Ana Souza", company: "Clínica Pele Bela", status: "Concluído", companyLogo: "https://placehold.co/40x40.png?text=PB" },
  { id: "3", date: "20 de Maio de 2024", time: "09:00", service: "Consulta Odontológica", professional: "Dr. Carlos Lima", company: "Sorrisos Brilhantes Dental", status: "Cancelado pelo cliente", companyLogo: "https://placehold.co/40x40.png?text=SB" },
];


export default function ClientHistoryPage() {
  useEffect(() => {
    document.title = `Histórico de Agendamentos - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <HistoryIcon className="mr-3 h-8 w-8 text-primary" /> Histórico de Agendamentos
          </CardTitle>
          <CardDescription>Veja todos os seus agendamentos passados.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/client">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {pastAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Image src={appt.companyLogo} alt={appt.company} width={24} height={24} className="rounded-sm" data-ai-hint="logotipo empresa" />
                        <span>{appt.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>{appt.service}</TableCell>
                    <TableCell>{appt.professional}</TableCell>
                    <TableCell>{appt.date}</TableCell>
                    <TableCell>{appt.time}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            appt.status === "Concluído" ? "bg-green-100 text-green-700" : 
                            appt.status.startsWith("Cancelado") ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                            {appt.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm">Reagendar</Button> {/* Placeholder */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Você ainda não possui histórico de agendamentos.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
