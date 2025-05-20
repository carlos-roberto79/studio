
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Edit, Save, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image"; 
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, updateCompanyDetails, type CompanyData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";

type CompanyProfileFormData = Omit<CompanyData, 'id' | 'owner_uid' | 'created_at' | 'updated_at' | 'plan_id' | 'customization' | 'operating_hours'>;

export default function EditCompanyProfilePage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const { user, role, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<CompanyProfileFormData>({
    company_name: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    public_link_slug: "",
    description: "",
    logo_url: "https://placehold.co/120x120.png?text=Logo",
    profile_complete: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(formData.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [companyIdToUpdate, setCompanyIdToUpdate] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    document.title = `Editar Perfil da Empresa - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      setIsLoadingPage(true);
      getCompanyDetailsByOwner(user.id)
        .then(data => {
          if (data) {
            setFormData({
              company_name: data.company_name || "",
              cnpj: data.cnpj || "",
              address: data.address || "",
              phone: data.phone || "",
              email: data.email || "",
              public_link_slug: data.public_link_slug || "",
              description: data.description || "",
              logo_url: data.logo_url || "https://placehold.co/120x120.png?text=Logo",
              profile_complete: data.profile_complete || false,
            });
            setImagePreview(data.logo_url || "https://placehold.co/120x120.png?text=Logo");
            setCompanyIdToUpdate(data.id || null);
          } else {
            // Se não houver dados, pode ser o primeiro acesso para completar o perfil
            // Mantém os valores padrão ou limpos do estado inicial
            setImagePreview("https://placehold.co/120x120.png?text=Logo");
          }
        })
        .catch(error => {
          console.error("Erro ao buscar dados da empresa para edição:", error);
          toast({ title: "Erro", description: "Não foi possível carregar os dados da sua empresa para edição.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!authLoading && (!user || role !== USER_ROLES.COMPANY_ADMIN)) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, role, authLoading, router, toast]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (name === 'public_link_slug') {
        setFormData(prev => ({ ...prev, public_link_slug: value.toLowerCase().replace(/\s+/g, '-') }));
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!formData.company_name || !formData.email || !formData.public_link_slug) {
      toast({ title: "Erro", description: "Nome da empresa, e-mail e slug do link são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    if (!user || !user.id) {
      toast({ title: "Erro de Autenticação", description: "Não foi possível identificar o usuário.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    try {
      // Se companyIdToUpdate não existe, significa que é a primeira vez que salvamos (via /register-company ou aqui)
      // e precisamos criar o registro. Se existe, atualizamos.
      // No entanto, a lógica atual implica que `addCompanyDetails` já foi chamado via CompanyRegistrationForm.
      // Aqui, focaremos em `updateCompanyDetails`. Se `companyIdToUpdate` for null, algo está errado no fluxo.
      if (!companyIdToUpdate) {
         // Isso pode acontecer se o usuário acessa diretamente /edit-profile sem ter passado por /register-company e sem ter um registro prévio.
         // Ou se getCompanyDetailsByOwner falhou em retornar um ID.
         // Para este protótipo, vamos assumir que um registro de empresa (mesmo que incompleto) é criado em /register-company.
         // Se o usuário pulou /register-company, ele verá o "Complete o Perfil" no dashboard, que o trará para cá.
         // Se companyIdToUpdate for null aqui, idealmente deveríamos tentar um 'upsert' ou verificar se realmente falta um ID.
         // Por agora, vamos dar um erro se o ID não for encontrado, pois ele deveria existir se o fluxo foi seguido.
        const existingCompany = await getCompanyDetailsByOwner(user.id);
        if (existingCompany && existingCompany.id) {
            await updateCompanyDetails(existingCompany.id, formData);
        } else {
             toast({ title: "Erro", description: "Não foi possível encontrar o registro da empresa para atualizar. Complete o cadastro inicial primeiro.", variant: "destructive" });
             setIsSaving(false);
             return;
        }
      } else {
         await updateCompanyDetails(companyIdToUpdate, formData);
      }

      toast({ title: "Perfil Atualizado", description: "As informações da sua empresa foram salvas com sucesso." });
      router.push('/dashboard/company'); 
    } catch (error: any) {
      console.error("Erro ao salvar perfil da empresa:", error);
      toast({ title: "Falha ao Salvar", description: error.message || "Não foi possível salvar as informações da empresa.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, logo_url: result })); // Salva como Data URL para simulação
        // Em um app real, aqui você faria o upload para o Supabase Storage e salvaria a URL pública.
      };
      reader.readAsDataURL(file);
      toast({ title: "Simulação", description: "Logo carregado para preview. Em um app real, seria enviado ao servidor."});
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
            <Card className="shadow-lg"><CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
                    <Skeleton className="h-[120px] w-[120px] rounded-lg" />
                    <div className="flex-grow w-full space-y-2"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-10 w-full" /></div>
                </div>
                {[1,2,3,4].map(i => <div key={i} className="space-y-2"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-10 w-full" /></div>)}
                <div className="flex justify-end"><Skeleton className="h-10 w-28" /></div>
            </CardContent></Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Edit className="mr-3 h-8 w-8 text-primary" /> Editar Perfil da Empresa
          </CardTitle>
          <CardDescription>Atualize as informações públicas e de contato da sua empresa.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSaveChanges}>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
              <div className="relative">
                <NextImage 
                  src={imagePreview || "https://placehold.co/120x120.png?text=Logo"} 
                  alt="Logo da Empresa" 
                  width={120} 
                  height={120} 
                  className="rounded-lg border object-cover" 
                  data-ai-hint="logotipo empresa" 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button type="button" size="sm" variant="outline" className="absolute -bottom-2 -right-2" onClick={triggerFileInput}>
                  <ImageIcon className="mr-1 h-3 w-3" /> Alterar
                </Button>
              </div>
              <div className="flex-grow w-full">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input id="companyName" name="company_name" value={formData.company_name} onChange={handleInputChange} className="mt-1 text-lg font-semibold" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="XX.XXX.XXX/XXXX-XX" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone de Contato Principal</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail de Contato Principal</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="contato@suaempresa.com" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Rua Exemplo, 123, Bairro, Cidade - UF, CEP" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="description">Descrição da Empresa (para página pública)</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Descreva seus serviços, diferenciais, etc." className="mt-1" rows={4} />
            </div>
            
            <div>
                <Label htmlFor="publicLinkSlug">Slug do Link Público de Agendamento</Label>
                <div className="flex items-center mt-1">
                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                    /agendar/
                    </span>
                    <Input id="publicLinkSlug" name="public_link_slug" value={formData.public_link_slug} onChange={handleInputChange} placeholder="sua-empresa" className="rounded-l-none"/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Seu link público será: {typeof window !== 'undefined' ? window.location.origin : 'https://tds.agenda'}/agendar/{formData.public_link_slug || "sua-empresa"}. Use letras minúsculas, números e hífens.
                </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || authLoading || isLoadingPage}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

