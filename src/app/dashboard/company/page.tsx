"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, CalendarDays, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';


// Mock data
const professionals = [
  { id: "1", name: "Dr. Alice Silva", specialty: "Dentista", appointmentsToday: 5, avatar: "https://placehold.co/40x40.png?text=AS" },
  { id: "2", name: "João Dantas", specialty: "Cabeleireiro", appointmentsToday: 8, avatar: "https://placehold.co/40x40.png?text=JD" },
  { id: "3", name: "Maria Garcia", specialty: "Terapeuta", appointmentsToday: 3, avatar: "https://placehold.co/40x40.png?text=MG" },
];

const companyStats = [
    { title: "Total de Agendamentos", value: "256", icon: <CalendarDays className="h-6 w-6 text-primary" /> },
    { title: "Profissionais Ativos", value: "3", icon: <Users className="h-6 w-6 text-primary" /> },
    { title: "Receita Mensal", value: "R$12.500", icon: <BarChart3 className="h-6 w-6 text-primary" /> },
];

export default function CompanyAdminPage() {
  useEffect(() => {
    document.title = `Painel da Empresa - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Gerenciamento da Empresa</CardTitle>
        <CardDescription>Supervisione as operações, profissionais e desempenho da sua empresa.</CardDescription>
      </CardHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companyStats.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+10% do último mês</p> {/* Placeholder change */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Profissionais</CardTitle>
            <CardDescription>Veja, adicione ou edite profissionais em sua empresa.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/company/add-professional">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Profissional
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Agendamentos Hoje</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell>
                    <Image src={prof.avatar} alt={prof.name} width={40} height={40} className="rounded-full" data-ai-hint="avatar pessoa" />
                  </TableCell>
                  <TableCell className="font-medium">{prof.name}</TableCell>
                  <TableCell>{prof.specialty}</TableCell>
                  <TableCell>{prof.appointmentsToday}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" aria-label="Editar profissional">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" aria-label="Remover profissional">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Perfil e Configurações da Empresa</CardTitle>
            <CardDescription>Atualize as informações da sua empresa e o link público de agendamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">Seu link público de agendamento: <Link href="/schedule/your-company-slug" className="text-primary hover:underline">/agendar/sua-empresa-slug</Link></p>
            <Button asChild>
              <Link href="/dashboard/company/edit-profile">
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil da Empresa
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
