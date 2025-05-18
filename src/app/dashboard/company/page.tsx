
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, CalendarDays, BarChart3, LinkIcon, UserPlus, Clock, Settings2, ShoppingBag, Settings, DollarSign, Eye, Info, ListChecks, FileSpreadsheet, TrendingUp, Package, UserX, Activity, CalendarX2, Repeat, Star, Award, LineChart, Timer, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


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

const mockCompanyAlerts = [
    "Lembrete: 5 pagamentos pendentes esta semana.",
    "Pico de agendamentos previsto para Sexta-feira.",
    "Atualize os horários de feriado para o próximo mês.",
    "💡 Dica: Use o relatório de 'Serviços Mais Populares' para identificar oportunidades!"
];

export default function CompanyAdminPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [publicLink, setPublicLink] = useState("");
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    document.title = `Painel da Empresa - ${APP_NAME}`;
    if (typeof window !== "undefined") {
      const constructedLink = `${window.location.origin}/schedule/${companyPublicSlug}`;
      setPublicLink(constructedLink);

      const storedProfileStatus = localStorage.getItem('tdsagenda_companyProfileComplete_mock');
      if (storedProfileStatus === 'true') {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false); 
      }
      setCheckingProfile(false);
    }
  }, []); 

  useEffect(() => {
    if (!loading && user) {
      if (role !== USER_ROLES.COMPANY_ADMIN) {
        router.push('/dashboard');
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

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

  if (loading || !user || (user && role !== USER_ROLES.COMPANY_ADMIN) || checkingProfile) {
     return (
      <div className="space-y-8">
        <CardHeader className="px-0">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/4" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-1/2 mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-10 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold">Gerenciamento da Empresa</CardTitle>
        <CardDescription>Supervisione as operações, profissionais, serviços e desempenho da sua empresa.</CardDescription>
      </CardHeader>

      {!isProfileComplete && (
        <Card className="mb-8 shadow-lg border-primary bg-primary/5">
         <CardHeader className="flex flex-row items-center space-x-3">
            <Info className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <CardTitle className="text-xl text-primary">Complete o Perfil da Sua Empresa!</CardTitle>
              <CardDescription className="text-primary/90">
                Para aproveitar ao máximo o ${APP_NAME} e publicar sua agenda, é essencial configurar os dados da sua empresa.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-foreground">
              Clique no botão abaixo para adicionar ou editar informações importantes como:
            </p>
            <ul className="list-disc list-inside mb-5 space-y-1 text-sm text-muted-foreground">
              <li>Nome da Empresa, CNPJ, Endereço Completo</li>
              <li>Telefone e E-mail de contato para seus clientes</li>
              <li>O link público personalizado para sua página de agendamentos</li>
              <li>O logo da sua empresa para identificação visual</li>
            </ul>
            <Button asChild size="lg" variant="default">
              <Link href="/dashboard/company/edit-profile">
                <Edit className="mr-2 h-5 w-5" /> Completar/Editar Perfil da Empresa
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

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
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Alertas e Notificações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
            {mockCompanyAlerts.length > 0 ? (
                <ul className="space-y-2">
                    {mockCompanyAlerts.map((alert, index) => (
                        <li key={index} className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">{alert}</li>
                    ))}
                </ul>
            ) : <p className="text-muted-foreground">Nenhum alerta no momento.</p>}
        </CardContent>
      </Card>

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
            <CardTitle>Gestão de Serviços e Agendas</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <Button asChild>
              <Link href="/dashboard/company/services">
                <ShoppingBag className="mr-2 h-4 w-4" /> Configurar Serviços
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/company/availability-types">
                <ListChecks className="mr-2 h-4 w-4" /> Tipos de Disponibilidade
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/company/schedules-overview">
                <Eye className="mr-2 h-4 w-4" /> Visão Geral das Agendas
              </Link>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Financeiro e Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h4 className="text-md font-semibold mb-3 text-primary">Financeiro</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/financials">
                            <DollarSign className="mr-2 h-4 w-4" /> Painel Financeiro
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/revenue-by-period">
                            <LineChart className="mr-2 h-4 w-4" /> Faturamento por Período
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/revenue-by-service">
                            <TrendingUp className="mr-2 h-4 w-4" /> Faturamento por Serviço
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/revenue-by-professional">
                            <DollarSign className="mr-2 h-4 w-4" /> Faturamento por Profissional
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/commissions">
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Relatório de Comissões
                        </Link>
                    </Button>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold mb-3 text-primary">Operacional e Agenda</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/occupancy">
                            <BarChart3 className="mr-2 h-4 w-4" /> Agenda e Ocupação
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/cancellations-no-shows">
                            <CalendarX2 className="mr-2 h-4 w-4" /> Cancelamentos e Faltas
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/average-service-time">
                            <Timer className="mr-2 h-4 w-4" /> Tempo Médio de Atendimento
                        </Link>
                    </Button>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold mb-3 text-primary">Clientes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/new-clients">
                            <UserPlus className="mr-2 h-4 w-4" /> Relatório de Novos Clientes
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/client-activity">
                            <UserX className="mr-2 h-4 w-4" /> Clientes Ativos vs. Inativos
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/client-frequency">
                            <Repeat className="mr-2 h-4 w-4" /> Frequência por Cliente
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/service-reviews">
                            <Star className="mr-2 h-4 w-4" /> Avaliações e Notas
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div>
                <h4 className="text-md font-semibold mb-3 text-primary">Serviços e Profissionais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/professional-performance">
                            <Activity className="mr-2 h-4 w-4" /> Desempenho por Profissional
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/professional-ranking">
                            <Award className="mr-2 h-4 w-4" /> Ranking de Profissionais
                        </Link>
                    </Button>
                     <Button asChild variant="outline">
                        <Link href="/dashboard/company/reports/top-services">
                            <Package className="mr-2 h-4 w-4" /> Serviços Mais Populares
                        </Link>
                    </Button>
                </div>
            </div>
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
            <CardTitle>Configurações da Empresa</CardTitle>
            <CardDescription>Defina as configurações gerais e de perfil da sua empresa.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild>
              <Link href="/dashboard/company/edit-profile">
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil da Empresa
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/company/general-settings/availability">
                <Clock className="mr-2 h-4 w-4" /> Horário de Funcionamento
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/company/notifications">
                <Bell className="mr-2 h-4 w-4" /> Configurar Notificações
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    
    

    

    
