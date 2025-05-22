
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Input não é usado diretamente aqui, mas pode ser em futuras edições.
// import { Input } from "@/components/ui/input"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Users, CalendarDays, BarChart3, LinkIcon, UserPlus, Clock, Settings2, ShoppingBag, Settings, DollarSign, Eye, Info, ListChecks, FileSpreadsheet, TrendingUp, Package, UserX, Activity, CalendarX2, Repeat, Star, Award, LineChart, Timer, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyDetailsByOwner, type CompanyData, getProfessionalsByCompany, type ProfessionalData, deleteProfessional } from "@/services/supabaseService";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const companyStatsMock = [
    { title: "Total de Agendamentos (Supabase)", value: "0", icon: <CalendarDays className="h-6 w-6 text-primary" /> },
    { title: "Receita Mensal Estimada (Supabase)", value: "R$0,00", icon: <BarChart3 className="h-6 w-6 text-primary" /> },
];

const mockCompanyAlerts = [
    "Lembrete: Verifique os novos agendamentos para esta semana.",
    "Atualize as informações do seu horário de funcionamento para feriados.",
    "💡 Dica: Utilize os relatórios para acompanhar o desempenho da sua empresa!"
];

export default function CompanyAdminPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalData[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [publicLink, setPublicLink] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<ProfessionalData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Painel da Empresa - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!authLoading) {
      if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
        setIsLoadingPage(true);
        getCompanyDetailsByOwner(user.id)
          .then(data => {
            if (!isMounted) return;
            setCompanyData(data);
            if (data && data.id) {
              fetchProfessionals(data.id);
              if (data.public_link_slug && typeof window !== "undefined") {
                setPublicLink(`${window.location.origin}/schedule/${data.public_link_slug}`);
              } else if (typeof window !== "undefined") {
                setPublicLink(`${window.location.origin}/schedule/configure-seu-slug`);
              }
            } else {
              if (typeof window !== "undefined") {
                 setPublicLink(`${window.location.origin}/schedule/configure-seu-slug`);
              }
            }
          })
          .catch(error => {
            if (!isMounted) return;
            console.error("Erro ao buscar dados da empresa:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os dados da sua empresa.", variant: "destructive" });
          })
          .finally(() => {
            if (isMounted) setIsLoadingPage(false);
          });
      } else if (!user && !authLoading) {
        router.push('/login');
      } else if (user && role !== USER_ROLES.COMPANY_ADMIN && !authLoading) {
        router.push('/dashboard');
      } else if (!user) {
        setIsLoadingPage(false); // Explicitly set loading to false if no user
      }
    }
    return () => { isMounted = false; };
  }, [user, role, authLoading, router, toast]);

  const fetchProfessionals = async (companyId: string) => {
    try {
      const fetchedProfessionals = await getProfessionalsByCompany(companyId);
      setProfessionals(fetchedProfessionals || []); // Garantir que seja um array
    } catch (error: any) {
      toast({ title: "Erro ao buscar profissionais", description: error.message, variant: "destructive" });
      setProfessionals([]); // Definir como array vazio em caso de erro
    }
  };

  const copyPublicLink = () => {
    if (!publicLink || publicLink.includes("configure-seu-slug") || !companyData?.profile_complete) {
        toast({ title: "Link Indisponível", description: "Complete o perfil da sua empresa para gerar e usar o link público.", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(publicLink)
      .then(() => {
        toast({ title: "Link Copiado!", description: "O link de agendamento público foi copiado para sua área de transferência." });
      })
      .catch(err => {
        toast({ title: "Erro ao Copiar", description: "Não foi possível copiar o link.", variant: "destructive" });
        console.error('Erro ao copiar link: ', err);
      });
  };

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete || !professionalToDelete.id) return;

    setIsSaving(true);
    try {
      const success = await deleteProfessional(professionalToDelete.id);
      if (success) {
        toast({ title: "Profissional Excluído", description: `${professionalToDelete.name} foi removido(a) com sucesso.` });
        setProfessionals(prevProfessionals => prevProfessionals.filter(prof => prof.id !== professionalToDelete.id));
      } else {
         toast({ title: "Erro", description: `Não foi possível remover ${professionalToDelete.name}.`, variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Erro ao excluir profissional:", error);
      toast({ title: "Erro", description: error.message || "Ocorreu um erro ao excluir o profissional.", variant: "destructive" });
    } finally {
      setIsSaving(false);
      setIsDeleteDialogOpen(false);
      setProfessionalToDelete(null);
    }
  };

  const showCompleteProfileCard = !isLoadingPage && (!companyData || !companyData.profile_complete);

  if (authLoading || isLoadingPage) {
     return (
      <div className="space-y-8">
        <CardHeader className="px-0">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
            <Skeleton className="h-10 w-full md:w-48" />
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
      {showCompleteProfileCard && (
        <Card className="mb-8 shadow-lg border-primary bg-primary/5">
         <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companyStatsMock.map(stat => (
          <Card key={stat.title} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.title.includes("Agendamentos") ? (companyData?.id ? professionals.reduce((acc, p) => acc + (/*mocked appointments count per prof*/ 5), 0) : "0") : stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.title.includes("Agendamentos") ? `Baseado nos profissionais cadastrados` : "+10% do último mês (Mock)"}</p>
            </CardContent>
          </Card>
        ))}
         <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profissionais Ativos</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{professionals.length}</div>
              <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
          </Card>
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
          <Button asChild className="w-full md:w-auto">
            <Link href="/dashboard/company/add-professional">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Profissional
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {professionals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((prof) => (
                  <TableRow key={prof.id}>
                    <TableCell className="font-medium">{prof.name}</TableCell>
                    <TableCell>{prof.specialty}</TableCell>
                    <TableCell>{prof.email}</TableCell>
                    <TableCell className="text-right space-x-1 sm:space-x-2">
                      <Button variant="outline" size="icon" aria-label="Editar profissional" asChild>
                         <Link href={`/dashboard/company/professionals/edit/${prof.id}`}>
                           <Edit className="h-4 w-4" />
                         </Link>
                      </Button>
                      <Button variant="destructive" size="icon" aria-label="Remover profissional"
                        onClick={() => {
                          setProfessionalToDelete(prof);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground py-4 text-center">Nenhum profissional cadastrado. Adicione seu primeiro profissional!</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o profissional
              <strong>{professionalToDelete?.name}</strong> e removerá seus dados de nossos servidores.
               Certifique-se de que não há agendamentos futuros vinculados a este profissional antes de prosseguir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfessional} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Gestão de Serviços e Agendas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <CardTitle>Gestão de Clientes e Acesso Público</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="publicLinkDisplay">Link Público de Agendamento da Sua Empresa:</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Input id="publicLinkDisplay" value={publicLink} readOnly className="bg-muted/50" />
                    <Button onClick={copyPublicLink} variant="outline" disabled={!publicLink || publicLink.includes("configure-seu-slug") || !companyData?.profile_complete}>
                        <LinkIcon className="mr-2 h-4 w-4" /> Copiar Link
                    </Button>
                </div>
                {!companyData?.profile_complete && <p className="text-xs text-destructive mt-1">Complete o perfil da sua empresa para ativar o link público.</p>}
            </div>
            <Button asChild variant="outline">
                <Link href="/dashboard/company/add-client">
                    <UserPlus className="mr-2 h-4 w-4" /> Adicionar Cliente Manualmente
                </Link>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Configurações da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild variant="outline">
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
              <Link href="/dashboard/company/agenda-blocks">
                <CalendarX2 className="mr-2 h-4 w-4" /> Bloqueios de Agenda
              </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/dashboard/company/notifications">
                    <Bell className="mr-2 h-4 w-4" /> Configurar Notificações
                </Link>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Relatórios</CardTitle>
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
                            <Activity className="mr-2 h-4 w-4" /> Clientes Ativos vs. Inativos
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
                        <Link href="/dashboard/company/reports/top-services">
                            <Package className="mr-2 h-4 w-4" /> Serviços Mais Populares
                        </Link>
                    </Button>
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
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    