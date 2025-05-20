
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, UserCog, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image"; // Next.js Image
import { useAuth } from "@/contexts/AuthContext";
import { getProfessionalByUserId, updateProfessional, type ProfessionalData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function ProfessionalProfilePage() {
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfessionalData>>({
    name: "",
    phone: "",
    specialty: "",
    bio: "",
    profile_picture_url: "https://placehold.co/120x120.png?text=Perfil",
    services_offered_text: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(formData.profile_picture_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  useEffect(() => {
    document.title = `Editar Meu Perfil - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.PROFESSIONAL) {
      setIsLoadingPage(true);
      getProfessionalByUserId(user.id)
        .then(profData => {
          if (profData && profData.id) {
            setProfessionalId(profData.id);
            setFormData({
              name: profData.name || "",
              phone: profData.phone || "",
              specialty: profData.specialty || "",
              bio: profData.bio || "",
              profile_picture_url: profData.profile_picture_url || "https://placehold.co/120x120.png?text=Perfil",
              services_offered_text: profData.services_offered_text || "",
            });
            setImagePreview(profData.profile_picture_url || "https://placehold.co/120x120.png?text=Perfil");
          } else {
            toast({ title: "Erro", description: "Perfil profissional não encontrado. Contate o administrador da sua empresa.", variant: "destructive" });
          }
        })
        .catch(error => {
          console.error("Erro ao buscar dados do perfil profissional:", error);
          toast({ title: "Erro ao Carregar", description: "Não foi possível carregar os dados do seu perfil.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!authLoading && (!user || role !== USER_ROLES.PROFESSIONAL)) {
      router.push(user ? '/dashboard' : '/login');
    } else if (!authLoading && !user) {
      setIsLoadingPage(false);
    }
  }, [user, role, authLoading, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) {
      toast({ title: "Erro", description: "ID do profissional não encontrado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    const dataToUpdate: Partial<Omit<ProfessionalData, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'user_id' | 'email' | 'availability'>> = {
      name: formData.name,
      phone: formData.phone,
      specialty: formData.specialty,
      bio: formData.bio,
      profile_picture_url: formData.profile_picture_url, // Manter URL, upload real seria separado
      services_offered_text: formData.services_offered_text,
    };

    try {
      await updateProfessional(professionalId, dataToUpdate);
      toast({ title: "Perfil Atualizado", description: "Suas informações de perfil foram salvas." });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil profissional:", error);
      toast({ title: "Falha ao Salvar", description: error.message || "Não foi possível salvar suas informações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, profile_picture_url: result })); // Salva como Data URL para simulação de preview
        // Em um app real, aqui você faria o upload para o Supabase Storage e salvaria a URL pública.
      };
      reader.readAsDataURL(file);
      toast({ title: "Simulação", description: "Foto carregada para preview. Em um app real, seria enviada ao servidor."});
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (authLoading || isLoadingPage) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
              <Skeleton className="h-[120px] w-[120px] rounded-full" />
              <div className="flex-grow w-full space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
             <div className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            <div className="flex justify-end"><Skeleton className="h-10 w-36" /></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <UserCog className="mr-3 h-8 w-8 text-primary" /> Editar Meu Perfil Profissional
          </CardTitle>
          <CardDescription>Mantenha suas informações atualizadas para seus clientes.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/professional">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSaveChanges}>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
              <div className="relative">
                <NextImage 
                  src={imagePreview || "https://placehold.co/120x120.png?text=Perfil"} 
                  alt="Foto do Profissional" 
                  width={120} height={120} 
                  className="rounded-full border object-cover" 
                  data-ai-hint="avatar pessoa" 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button type="button" size="sm" variant="outline" className="absolute -bottom-2 -right-2" onClick={triggerFileInput}>
                  <ImageIcon className="mr-1 h-3 w-3" /> Alterar
                </Button>
              </div>
              <div className="flex-grow w-full">
                <Label htmlFor="name">Seu Nome Completo</Label>
                <Input id="name" name="name" value={formData.name || ""} onChange={handleInputChange} className="mt-1 text-lg font-semibold" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-email">E-mail de Contato (Login)</Label>
                <Input id="prof-email" type="email" value={user?.email || ""} disabled className="mt-1 bg-muted/50" />
                 <p className="text-xs text-muted-foreground mt-1">Para alterar o e-mail de login, contate o administrador da empresa.</p>
              </div>
              <div>
                <Label htmlFor="phone">Telefone de Contato (Visível para clientes)</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone || ""} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="specialty">Sua Especialidade Principal</Label>
              <Input id="specialty" name="specialty" value={formData.specialty || ""} onChange={handleInputChange} placeholder="Ex: Ortodontista, Terapeuta Holístico" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="bio">Sua Biografia / Sobre Você (Visível na página de agendamento)</Label>
              <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleInputChange} placeholder="Descreva sua experiência, abordagem, paixões, etc." className="mt-1" rows={5} />
            </div>

            <div>
              <Label htmlFor="services_offered_text">Serviços que Você Oferece (separados por vírgula)</Label>
              <Input id="services_offered_text" name="services_offered_text" value={formData.services_offered_text || ""} onChange={handleInputChange} placeholder="Ex: Clareamento Dental, Terapia de Casal, Corte Masculino" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Estes serviços estarão disponíveis para agendamento. Detalhes como duração e preço são configurados pelo administrador da empresa.</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || authLoading || isLoadingPage}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? "Salvando..." : "Salvar Alterações no Perfil"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
