
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert, Briefcase, Palette } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext"; // Certifique-se que este hook existe

export default function SiteAdminDashboardPage() {
  const { user } = useAuth(); // Apenas para obter o nome/email se necessário

  useEffect(() => {
    document.title = `Painel Super Admin - ${APP_NAME}`;
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center">
            <ShieldAlert className="mr-3 h-8 w-8 text-primary" /> Painel de Administração do Site
          </CardTitle>
          <CardDescription className="text-lg">
            Bem-vindo(a), {user?.email}! Gerencie todas as empresas e configurações globais da plataforma {APP_NAME}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Gestão de Empresas</CardTitle>
              <CardDescription>Visualize, adicione, edite, bloqueie ou exclua empresas cadastradas na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/site-admin/companies">Acessar Gestão de Empresas</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" /> Personalização da Interface</CardTitle>
              <CardDescription>Modifique cores e layouts globalmente ou para empresas específicas (funcionalidade placeholder).</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/site-admin/customization">Acessar Personalização</Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Estatísticas Gerais (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
                <p className="text-2xl font-bold">123</p>
            </div>
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">4567</p>
            </div>
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold">98</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

