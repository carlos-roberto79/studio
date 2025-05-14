
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarCheck, UserCircle } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react'; // Added React to imports for useEffect

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    document.title = `Painel - ${APP_NAME}`;
  }, []);

  if (loading) {
    return <div className="text-center p-10">Carregando painel...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Redirecionando para o login...</div>; // Deve ser tratado pelo layout
  }
  
  const getRoleSpecificInfo = () => {
    switch (role) {
      case "company_admin":
        return {
          title: "Painel da Empresa",
          description: "Gerencie seu negócio, profissionais e veja análises.",
          cta: {
            text: "Gerenciar Empresa",
            href: "/dashboard/company",
            icon: <Briefcase className="mr-2 h-4 w-4" />
          },
          stats: [
            { label: "Total de Agendamentos", value: "150" },
            { label: "Profissionais Ativos", value: "5" },
            { label: "Receita Este Mês", value: "R$5.200" },
          ]
        };
      case "professional":
        return {
          title: "Painel do Profissional",
          description: "Veja sua agenda, gerencie agendamentos e atualize sua disponibilidade.",
           cta: {
            text: "Ver Minha Agenda",
            href: "/dashboard/professional",
            icon: <CalendarCheck className="mr-2 h-4 w-4" />
          },
           stats: [
            { label: "Próximos Agendamentos", value: "12" },
            { label: "Horários Disponíveis Hoje", value: "3" },
            { label: "Concluídos Esta Semana", value: "25" },
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
            { label: "Próximos Agendamentos", value: "2" },
            { label: "Agendamentos Passados", value: "8" },
            { label: "Profissionais Favoritos", value: "1" },
          ]
        };
      default:
        return {
          title: "Bem-vindo(a) ao seu Painel!",
          description: "Gerencie suas atividades e configurações aqui.",
          cta: null,
          stats: []
        };
    }
  };

  const roleInfo = getRoleSpecificInfo();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{roleInfo.title}</CardTitle>
          <CardDescription className="text-lg">{roleInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Bem-vindo(a), {user.email}! Você está logado como {role}.
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
         <div className="grid gap-6 md:grid-cols-3">
          {roleInfo.stats.map(stat => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-4xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {role === 'client' && (
            <Button variant="outline" asChild><Link href="/schedule/example-company">Agendar Novo Horário</Link></Button>
          )}
          {role === 'professional' && (
            <Button variant="outline" asChild><Link href="/dashboard/professional/availability">Definir Disponibilidade</Link></Button>
          )}
          {role === 'company_admin' && (
            // Corrigido o link para /dashboard/company onde os profissionais são gerenciados
            <Button variant="outline"asChild><Link href="/dashboard/company">Gerenciar Profissionais</Link></Button> 
          )}
          <Button variant="outline" asChild><Link href="/dashboard/settings">Configurações da Conta</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
