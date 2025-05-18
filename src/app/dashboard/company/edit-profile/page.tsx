
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Edit, Save, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image"; 
import { useRouter } from "next/navigation"; 

// Mock existing company data
const mockCompanyData = {
  companyName: "Salão Cortes Modernos",
  cnpj: "12.345.678/0001-99",
  address: "Rua da Moda, 123, Centro, Cidade Elegante",
  phone: "(11) 98765-4321",
  email: "contato@cortesmodernos.com",
  publicLinkSlug: "cortes-modernos",
  description: "Seu salão de beleza completo, especializado em cortes, coloração e tratamentos capilares.",
  logoUrl: "https://placehold.co/120x120.png?text=CM",
};

export default function EditCompanyProfilePage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const [companyName, setCompanyName] = useState(mockCompanyData.companyName);
  const [cnpj, setCnpj] = useState(mockCompanyData.cnpj);
  const [address, setAddress] = useState(mockCompanyData.address);
  const [phone, setPhone] = useState(mockCompanyData.phone);
  const [email, setEmail] = useState(mockCompanyData.email);
  const [publicLinkSlug, setPublicLinkSlug] = useState(mockCompanyData.publicLinkSlug);
  const [description, setDescription] = useState(mockCompanyData.description);
  const [logoUrl, setLogoUrl] = useState(mockCompanyData.logoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    document.title = `Editar Perfil da Empresa - ${APP_NAME}`;
    if (typeof window !== 'undefined') {
      const storedCompanyName = localStorage.getItem('tdsagenda_companyName_mock');
      const storedCompanyEmail = localStorage.getItem('tdsagenda_companyEmail_mock');
      if (storedCompanyName) setCompanyName(storedCompanyName);
      if (storedCompanyEmail) setEmail(storedCompanyEmail);
    }
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!companyName || !email || !publicLinkSlug) {
      toast({ title: "Erro", description: "Nome da empresa, e-mail e slug do link são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    console.log("Updating company profile:", { companyName, cnpj, address, phone, email, publicLinkSlug, description, logoUrl });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: "Perfil Atualizado", description: "As informações da sua empresa foram salvas com sucesso." });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tdsagenda_companyProfileComplete_mock', 'true'); 
      localStorage.setItem('tdsagenda_companyName_mock', companyName);
      localStorage.setItem('tdsagenda_companyEmail_mock', email);
    }
    
    setIsSaving(false);
    router.push('/dashboard/company'); 
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
                  src={logoUrl} 
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
              <div className="flex-grow">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 text-lg font-semibold" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="XX.XXX.XXX/XXXX-XX" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone de Contato Principal</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-mail de Contato Principal</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@suaempresa.com" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua Exemplo, 123, Bairro, Cidade - UF, CEP" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="description">Descrição da Empresa (para página pública)</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva seus serviços, diferenciais, etc." className="mt-1" rows={4} />
            </div>
            
            <div>
                <Label htmlFor="public-link-slug">Slug do Link Público de Agendamento</Label>
                <div className="flex items-center mt-1">
                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                    /agendar/
                    </span>
                    <Input id="public-link-slug" value={publicLinkSlug} onChange={(e) => setPublicLinkSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="sua-empresa" className="rounded-l-none"/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Seu link público será: {typeof window !== 'undefined' ? window.location.origin : 'https://tds.agenda'}/agendar/{publicLinkSlug || "sua-empresa"}. Use letras minúsculas, números e hífens.
                </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
