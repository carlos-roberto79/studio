
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarCheck, UserCircle, Settings, ShoppingBag, Clock, Package } from "lucide-react"; 
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react'; 

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    document.title = `Painel - ${APP_NAME}`;
  }, []);

  if (loading) {
    return <div className="text-center p-10">Carregando painel...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecionando para o login...</div>; 
  }
  
  const getRoleSpecificInfo = () => {
    switch (role) {
      case "company_admin":
        return {
          title: "Painel da Empresa",
          description: "Gerencie seu negócio, profissionais e veja análises.",
          cta: {
            text: "Acessar Gestão da Empresa",
            href: "/dashboard/company",
            icon: <Briefcase className="mr-2 h-4 w-4" />
          },
          stats: [
            { label: "Total de Agendamentos (Mock)", value: "150" },
            { label: "Profissionais Ativos (Mock)", value: "5" },
            { label: "Receita Este Mês (Mock)", value: "R$5.200" },
          ],
          quickActions: [
            { href: "/dashboard/company/services", label: "Gerenciar Serviços", icon: <ShoppingBag /> },
            { href: "/dashboard/company/add-professional", label: "Adicionar Profissional", icon: <UserCircle /> },
            { href: "/dashboard/settings", label: "Configurações da Conta", icon: <Settings /> },
          ]
        };
      case "professional":
        return {
          title: "Painel do Profissional",
          description: "Veja sua agenda, gerencie agendamentos e atualize sua disponibilidade.",
           cta: {
            text: "Ver Minha Agenda Completa",
            href: "/dashboard/professional/calendar", 
            icon: <CalendarCheck className="mr-2 h-4 w-4" />
          },
           stats: [
            { label: "Próximos Agendamentos (Mock)", value: "12" },
            { label: "Horários Disponíveis Hoje (Mock)", value: "3" },
            { label: "Concluídos Semana (Mock)", value: "25" },
          ],
          quickActions: [
            { href: "/dashboard/professional/availability", label: "Definir Disponibilidade", icon: <Clock /> },
            { href: "/dashboard/professional/profile", label: "Editar Meu Perfil", icon: <UserCircle /> },
            { href: "/dashboard/settings", label: "Configurações da Conta", icon: <Settings /> },
          ]
        };
      case "client":
        return {
          title: "Painel do Cliente",
          description: "Veja seus próximos agendamentos e gerencie suas reservas.",
          cta: {
            text: "Meus Agendamentos",
            href: "/dashboard/client",
            icon: <UserCircle className="mr-2 h-4 w-4" />
          },
          stats: [
            { label: "Próximos Agendamentos (Mock)", value: "2" },
            { label: "Agendamentos Passados (Mock)", value: "8" },
            { label: "Planos Assinados (Mock)", value: "1" },
          ],
          quickActions: [
            { href: "/schedule/example-company", label: "Agendar Novo Horário", icon: <CalendarCheck /> },
            { href: "/dashboard/client/history", label: "Histórico de Agendamentos", icon: <Briefcase /> },
            { href: "/dashboard/client/plans", label: "Ver Planos e Assinaturas", icon: <Package /> },
            { href: "/dashboard/settings", label: "Configurações da Conta", icon: <Settings /> },
          ]
        };
      default:
        return {
          title: "Bem-vindo(a) ao seu Painel!",
          description: "Gerencie suas atividades e configurações aqui.",
          cta: null,
          stats: [],
          quickActions: [
            { href: "/dashboard/settings", label: "Configurações da Conta", icon: <Settings /> },
          ]
        };
    }
  };

  const roleInfo = getRoleSpecificInfo();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold">{roleInfo.title}</CardTitle>
          <CardDescription className="text-base sm:text-lg">{roleInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Olá, {user.email}! Você está logado como <span className="font-semibold text-primary">{role}</span>.
          </p>
          {roleInfo.cta && (
            <Button asChild size="lg">
              <Link href={roleInfo.cta.href}>
                {roleInfo.cta.icon} {roleInfo.cta.text} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {roleInfo.stats.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {roleInfo.stats.map(stat => (
            <Card key={stat.label} className="shadow-md">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl md:text-4xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {roleInfo.quickActions.map(action => (
            <Button key={action.href} variant="outline" asChild className="justify-start text-left h-auto py-3">
              <Link href={action.href} className="flex items-center space-x-3">
                {React.cloneElement(action.icon, { className: "h-5 w-5 text-primary" })}
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
