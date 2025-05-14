"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserCog, Bell, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    document.title = `Configurações da Conta - ${APP_NAME}`;
  }, []);

  if (authLoading) {
    return <div className="text-center p-10">Carregando configurações...</div>;
  }

  if (!user) {
    return <div className="text-center p-10">Por favor, faça login para ver as configurações.</div>;
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simula chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (newPassword && newPassword !== confirmNewPassword) {
      toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    // Adicionar mais validações/chamadas de API aqui
    
    toast({ title: "Configurações Salvas", description: "Suas preferências foram atualizadas." });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold flex items-center">
          <UserCog className="mr-3 h-8 w-8 text-primary" /> Configurações da Conta
        </CardTitle>
        <CardDescription>Gerencie seu perfil, preferências de notificação e configurações de segurança.</CardDescription>
      </CardHeader>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Endereço de E-mail</Label>
            <Input id="email" type="email" value={user.email || ""} disabled className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">O e-mail não pode ser alterado aqui.</p>
          </div>
          {/* Adicione outros campos de perfil conforme necessário, ex: Nome, Telefone */}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5" /> Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Notificações por E-mail</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receba atualizações e lembretes por e-mail.
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
              <span>Notificações por SMS</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receba alertas importantes por mensagem de texto (se disponível).
              </span>
            </Label>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /> Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
            <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
}
