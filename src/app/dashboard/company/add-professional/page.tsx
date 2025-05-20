
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, UserPlus, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, addProfessional } from "@/services/supabaseService";
import type { ProfessionalData } from "@/services/supabaseService";

// Mock data for specialties - pode ser removido se não for mais usado ou se as especialidades vierem de outro lugar
const specialties = ["Dentista", "Cabeleireiro", "Terapeuta", "Manicure", "Esteticista", "Personal Trainer"];

export default function AddProfessionalPage() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

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
    if (!companyId) {
      toast({ title: "Erro", description: "ID da empresa não encontrado. Não é possível adicionar profissional.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    if (!name || !email || !specialty) {
      toast({ title: "Erro", description: "Nome, e-mail e especialidade são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    const professionalData: Omit<ProfessionalData, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
      name,
      email,
      specialty,
      phone: phone || undefined, // Enviar undefined se vazio, para não salvar string vazia
      // user_id: null, // Se o profissional não tiver uma conta de login própria inicialmente
    };

    try {
      await addProfessional(companyId, professionalData);
      toast({ title: "Profissional Adicionado", description: `${name} foi adicionado(a) à sua equipe.` });
      setName("");
      setEmail("");
      setSpecialty("");
      setPhone("");
      // Potencialmente redirecionar ou atualizar uma lista em outro lugar
    } catch (error: any) {
      toast({ title: "Erro ao Adicionar Profissional", description: error.message, variant: "destructive" });
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
          <CardDescription>Cadastre um novo membro para sua equipe de profissionais.</CardDescription>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-name">Nome Completo</Label>
                <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dr. João Silva" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="prof-email">E-mail</Label>
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
            
            <p className="text-sm text-muted-foreground">
                Após adicionar, você poderá configurar os horários de disponibilidade e serviços específicos para este profissional.
                Um convite por e-mail poderá ser enviado para que ele(a) acesse o painel de profissional (funcionalidade futura).
            </p>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoadingCompany}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Profissional"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

    