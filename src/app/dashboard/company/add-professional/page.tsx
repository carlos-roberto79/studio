
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, UserPlus, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, addProfessional } from "@/services/supabaseService";
import type { ProfessionalData } from "@/services/supabaseService";

const specialties = ["Dentista", "Cabeleireiro", "Terapeuta", "Manicure", "Esteticista", "Personal Trainer"];
const TEMPORARY_PASSWORD = 'senhaPadrao123'; // APENAS PARA PROTOTIPAGEM - ALTAMENTE INSEGURO

export default function AddProfessionalPage() {
  const { toast } = useToast();
  const { user, role, createProfessionalUserAccount } = useAuth(); // Adicionado createProfessionalUserAccount
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Adicionar Profissional - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada. Cadastre os detalhes da empresa primeiro.", variant: "destructive" });
        }
        setIsLoadingCompany(false);
      });
    } else {
      setIsLoadingCompany(false);
    }
  }, [user, role, toast]);

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!companyId) {
      toast({ title: "Erro", description: "ID da empresa não encontrado. Não é possível adicionar profissional.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    if (!name || !email || !specialty) {
      toast({ title: "Erro de Validação", description: "Nome, e-mail e especialidade são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    try {
      // 1. Criar a conta de usuário no Supabase Auth e o perfil na tabela profiles
      const newAuthUser = await createProfessionalUserAccount(email, TEMPORARY_PASSWORD);
      
      if (!newAuthUser || !newAuthUser.id) {
        // O erro já deve ter sido lançado por createProfessionalUserAccount, mas para garantir:
        throw new Error("Falha ao criar a conta de autenticação para o profissional.");
      }

      // 2. Adicionar o profissional à tabela 'professionals', vinculando o user_id
      const professionalData: Omit<ProfessionalData, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
        name,
        email, // Mantemos o email aqui também para referência, se desejado
        specialty,
        phone: phone || undefined,
        user_id: newAuthUser.id, // Vincular o ID do usuário do Supabase Auth
      };

      await addProfessional(companyId, professionalData);
      
      toast({ 
        title: "Profissional Adicionado!", 
        description: (
          <div>
            <p>{name} foi adicionado(a) à sua equipe.</p>
            <p className="font-semibold mt-2">A senha temporária é: <span className="text-primary">{TEMPORARY_PASSWORD}</span></p>
            <p className="text-xs text-muted-foreground">Informe ao profissional para alterar esta senha no primeiro login.</p>
            <p className="text-xs text-destructive mt-1">Lembre-se: Se a confirmação de e-mail estiver ativa no Supabase, o profissional precisará confirmar o e-mail antes de poder logar.</p>
          </div>
        ),
        duration: 10000, // Manter o toast por mais tempo
      });
      setName("");
      setEmail("");
      setSpecialty("");
      setPhone("");
    } catch (error: any) {
      console.error("Erro completo ao adicionar profissional:", error);
      const errorMessage = error.message || "Ocorreu um erro desconhecido ao adicionar o profissional.";
      setSubmissionError(errorMessage);
      toast({ 
        title: "Erro ao Adicionar Profissional", 
        description: errorMessage, 
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingCompany) {
    return <div className="text-center p-10">Carregando dados da empresa...</div>;
  }
  if (!companyId && !isLoadingCompany) {
     return <div className="text-center p-10 text-destructive">Não foi possível carregar os dados da empresa. Verifique se o perfil da empresa está completo.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <UserPlus className="mr-3 h-8 w-8 text-primary" /> Adicionar Novo Profissional
          </CardTitle>
          <CardDescription>Cadastre um novo membro para sua equipe. Uma conta de login será criada com uma senha temporária.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSaveProfessional}>
          <CardContent className="pt-6 space-y-6">
            {submissionError && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{submissionError}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-name">Nome Completo</Label>
                <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dr. João Silva" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="prof-email">E-mail (para login)</Label>
                <Input id="prof-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: joao.silva@example.com" className="mt-1" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-specialty">Especialidade Principal</Label>
                <Input id="prof-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex: Dentista, Cabeleireiro" list="specialties-list" className="mt-1" />
                <datalist id="specialties-list">
                    {specialties.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <Label htmlFor="prof-phone">Telefone (Opcional)</Label>
                <Input id="prof-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
                <p><strong className="font-semibold">Atenção:</strong> Ao salvar, uma conta de usuário será criada para este profissional com o e-mail fornecido e a senha temporária: <strong className="text-primary">{TEMPORARY_PASSWORD}</strong>.</p>
                <p className="mt-1">O profissional deverá alterar esta senha no primeiro acesso. Se a confirmação de e-mail estiver habilitada no seu projeto Supabase, o profissional precisará confirmar o e-mail antes de poder logar.</p>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoadingCompany}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Profissional e Criar Conta"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
    
    