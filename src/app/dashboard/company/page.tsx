
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, CalendarDays, BarChart3, LinkIcon, UserPlus, Clock, Settings2, ShoppingBag } from "lucide-react"; // Added Settings2 for services
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";


// Mock data
const professionals = [
  { id: "1", name: "Dr. Alice Silva", specialty: "Dentista", appointmentsToday: 5, avatar: "https://placehold.co/40x40.png?text=AS" },
  { id: "2", name: "João Dantas", specialty: "Cabeleireiro", appointmentsToday: 8, avatar: "https://placehold.co/40x40.png?text=JD" },
  { id: "3", name: "Maria Garcia", specialty: "Terapeuta", appointmentsToday: 3, avatar: "https://placehold.co/40x40.png?text=MG" },
];

const companyStats = [
    { title: "Total de Agendamentos", value: "256", icon: <CalendarDays className="h-6 w-6 text-primary" /> },
    { title: "Profissionais Ativos", value: "3", icon: <Users className="h-6 w-6 text-primary" /> },
    { title: "Receita Mensal Estimada", value: "R$12.500", icon: <BarChart3 className="h-6 w-6 text-primary" /> },
];

const companyPublicSlug = "sua-empresa-incrivel"; 

export default function CompanyAdminPage() {
  const { toast } = useToast();
  const [publicLink, setPublicLink] = useState("");

  useEffect(() => {
    document.title = `Painel da Empresa - ${APP_NAME}`;
    const constructedLink = `${window.location.origin}/schedule/${companyPublicSlug}`;
    setPublicLink(constructedLink);
  }, []);

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast({ title: "Link Copiado!", description: "O link de agendamento público foi copiado para sua área de transferência." });
      })
      .catch(err => {
        toast({ title: "Erro ao Copiar", description: "Não foi possível copiar o link.", variant: "destructive" });
        console.error('Erro ao copiar link: ', err);
      });
  };

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Gerenciamento da Empresa</CardTitle>
        <CardDescription>Supervisione as operações, profissionais, serviços e desempenho da sua empresa.</CardDescription>
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
              <p className="text-xs text-muted-foreground">+10% do último mês</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
            <CardTitle>Gerenciar Serviços</CardTitle>
            <CardDescription>Configure os serviços oferecidos pela sua empresa.</CardDescription>
        </CardHeader>
        <CardContent>
             <Button asChild>
              <Link href="/dashboard/company/services">
                <ShoppingBag className="mr-2 h-4 w-4" /> Configurar Serviços
              </Link>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Gestão de Clientes e Acesso Público</CardTitle>
            <CardDescription>Adicione novos clientes e compartilhe seu link de agendamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="font-medium mb-2">Link Público de Agendamento</h4>
                <div className="flex items-center space-x-2">
                    <Input type="text" value={publicLink} readOnly className="bg-muted flex-grow" />
                    <Button onClick={copyPublicLink} variant="outline">
                        <LinkIcon className="mr-2 h-4 w-4" /> Copiar Link
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Compartilhe este link com seus clientes para que eles possam agendar horários online.</p>
            </div>
            <div className="border-t pt-6">
                <h4 className="font-medium mb-2">Cadastro de Clientes</h4>
                <p className="text-sm text-muted-foreground mb-3">Adicione clientes que não se cadastraram pelo link público ou que precisam de assistência para o primeiro agendamento.</p>
                 <Button asChild>
                  <Link href="/dashboard/company/add-client">
                    <UserPlus className="mr-2 h-4 w-4" /> Adicionar Cliente Manualmente
                  </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Perfil e Configurações da Empresa</CardTitle>
            <CardDescription>Atualize as informações da sua empresa e o slug do link público.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

    