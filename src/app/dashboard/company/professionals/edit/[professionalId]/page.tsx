// src/app/dashboard/company/professionals/edit/[professionalId]/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfessional, getProfessionalById, type ProfessionalData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";

const specialties = ["Dentista", "Cabeleireiro", "Terapeuta", "Manicure", "Esteticista", "Personal Trainer"];

export default function EditProfessionalPage({ params }: { params: { professionalId: string } }) {
  const { professionalId } = params;
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Editar Profissional - ${APP_NAME}`;
    if (!authLoading && (!user || role !== USER_ROLES.COMPANY_ADMIN)) {
      router.push(user ? '/dashboard' : '/login');
      return;
    }

    if (professionalId && !authLoading) {
      setIsLoading(true);
      getProfessionalById(professionalId)
        .then(data => {
          if (data) {
            setProfessionalData(data);
            setName(data.name);
            setEmail(data.email || "");
            setSpecialty(data.specialty || "");
            setPhone(data.phone || "");
          } else {
            setError("Profissional não encontrado.");
            toast({ title: "Erro", description: "Profissional não encontrado.", variant: "destructive" });
          }
        })
        .catch(err => {
          console.error("Erro ao buscar dados do profissional:", err);
          setError("Erro ao carregar dados do profissional.");
          toast({ title: "Erro", description: "Não foi possível carregar os dados do profissional.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading && !professionalId) {
         setError("ID do profissional não fornecido.");
         setIsLoading(false);
    }

  }, [professionalId, user, role, authLoading, router, toast]);

  const handleUpdateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!professionalData?.id) {
      toast({ title: "Erro", description: "Dados do profissional incompletos.", variant: "destructive" });
      return;
    }
     if (!name || !email || !specialty) {
      toast({ title: "Erro de Validação", description: "Nome, e-mail e especialidade são obrigatórios.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedData: Partial<ProfessionalData> = {
        name,
        email,
        specialty,
        phone: phone || null,
      };

      await updateProfessional(professionalData.id, updatedData);

      toast({ 
        title: "Profissional Atualizado!", 
        description: `${name} foi atualizado(a) com sucesso.`, 
      });
      
      // Redirecionar de volta para o painel da empresa/lista de profissionais
      router.push('/dashboard/company');

    } catch (err: any) {
      console.error("Erro ao atualizar profissional:", err);
      setError(err.message || "Ocorreu um erro ao atualizar o profissional.");
      toast({ 
        title: "Erro ao Atualizar Profissional", 
        description: err.message || "Ocorreu um erro desconhecido.", 
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <span className="ml-4 text-lg text-muted-foreground">Carregando dados do profissional...</span>
      </div>
    );
  }
  
  if (error) {
       return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-destructive text-center">
               <AlertCircle className="h-16 w-16 mb-4" />
               <p className="text-xl font-semibold">Erro ao Carregar Profissional</p>
               <p className="mt-2 text-muted-foreground">{error}</p>
                <Button asChild className="mt-6">
                   <Link href="/dashboard/company"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
               </Button>
           </div>
       );
   }

   if (!professionalData) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-muted-foreground text-center">
               <Info className="h-16 w-16 mb-4" />
               <p className="text-xl font-semibold">Profissional Não Encontrado</p>
               <p className="mt-2 text-muted-foreground">O profissional com o ID {professionalId} não foi encontrado.</p>
                <Button asChild className="mt-6">
                   <Link href="/dashboard/company"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Lista</Link>
               </Button>
           </div>
       );
   }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <User className="mr-3 h-8 w-8 text-primary" /> Editar Profissional
          </CardTitle>
          <CardDescription>Atualize as informações do profissional.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Lista de Profissionais
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleUpdateProfessional}>
          <CardContent className="pt-6 space-y-6">
             {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-name">Nome Completo</Label>
                <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dr. João Silva" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="prof-email">E-mail</Label>
                <Input id="prof-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: joao.silva@example.com" className="mt-1" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-specialty">Especialidade Principal</Label>
                <Input id="prof-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex: Dentista, Cabeleireiro" list="specialties-list" className="mt-1" required />
                <datalist id="specialties-list">
                    {specialties.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <Label htmlFor="prof-phone">Telefone (Opcional)</Label>
                <Input id="prof-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>
            
            {/* Informação sobre a conta de usuário associada (opcional, dependendo da complexidade desejada) */}
            {professionalData.user_id && (
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
                    <p>Este profissional está vinculado à uma conta de usuário. Alterações de e-mail aqui podem precisar ser sincronizadas com a autenticação do Supabase.</p>
                 </div>
            )}

            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
