
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, UserCog, Save, Image as ImageIcon, Loader2, Smartphone, QrCode } from "lucide-react"; // Adicionado Smartphone, QrCode
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getProfessionalByUserId, updateProfessional, type ProfessionalData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

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

  // Estado para simulação da conexão WhatsApp
  const [whatsAppConnected, setWhatsAppConnected] = useState(false);
  const [connectedWhatsAppNumber, setConnectedWhatsAppNumber] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("https://placehold.co/256x256.png?text=QR+Code");
  const [qrDialogStatus, setQrDialogStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");


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
            // Simular busca do status da conexão WhatsApp para este profissional
            // setWhatsAppConnected(profData.whatsapp_connected_mock || false); 
            // setConnectedWhatsAppNumber(profData.whatsapp_number_mock || null);
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
      profile_picture_url: formData.profile_picture_url,
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
        setFormData(prev => ({ ...prev, profile_picture_url: result }));
      };
      reader.readAsDataURL(file);
      toast({ title: "Simulação", description: "Foto carregada para preview. Em um app real, seria enviada ao servidor."});
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleWhatsAppConnect = () => {
    // Simulação de conexão
    setQrDialogStatus("loading");
    setQrCodeUrl(`https://placehold.co/256x256.png?text=QR+Code&v=${Date.now()}`); // Força recarga
    setTimeout(() => {
      const success = Math.random() > 0.3; // Simular sucesso/falha
      if (success) {
        setQrDialogStatus("connected");
        setWhatsAppConnected(true);
        setConnectedWhatsAppNumber(formData.phone || "+55 (XX) XXXXX-XXXX (Mock)"); // Usa o telefone do perfil ou um mock
        toast({ title: "WhatsApp Conectado!", description: "Seu WhatsApp foi conectado com sucesso."});
      } else {
        setQrDialogStatus("error");
        toast({ title: "Falha na Conexão", description: "Não foi possível conectar o WhatsApp. Tente gerar um novo QR Code.", variant: "destructive"});
      }
    }, 3000);
  };
  
  const handleGenerateNewQrCode = () => {
    setQrDialogStatus("loading");
    setQrCodeUrl(`https://placehold.co/256x256.png?text=QR+Code&v=${Date.now()}`); // Novo QR Code
    setTimeout(() => {
        if(qrDialogStatus !== 'connected') setQrDialogStatus("idle"); // Volta para idle se não estiver conectado
    }, 1500);
  }


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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Smartphone className="mr-2 h-5 w-5 text-primary"/>Conexão WhatsApp</CardTitle>
          <CardDescription>Conecte seu WhatsApp para receber notificações e interagir com clientes (funcionalidade simulada).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {whatsAppConnected && connectedWhatsAppNumber ? (
            <div>
              <p className="text-green-600 font-semibold">Conectado ao número: {connectedWhatsAppNumber}</p>
              <Button variant="outline" className="mt-2" onClick={() => { setWhatsAppConnected(false); setConnectedWhatsAppNumber(null); toast({title: "WhatsApp Desconectado"}); }}>Desconectar</Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Seu WhatsApp não está conectado.</p>
          )}
          {!whatsAppConnected && (
            <Dialog onOpenChange={(open) => { if (!open) setQrDialogStatus("idle"); }}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <QrCode className="mr-2 h-4 w-4"/> Conectar WhatsApp via QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Conectar WhatsApp</DialogTitle>
                  <DialogDescription>
                    Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos Conectados &gt; Conectar um aparelho e escaneie o QR Code abaixo.
                  </DialogDescription>
                </DialogHeader>
                <div className="my-6 flex flex-col items-center justify-center space-y-3">
                  {qrDialogStatus === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary"/>}
                  {(qrDialogStatus === "idle" || qrDialogStatus === "error") && <NextImage src={qrCodeUrl} alt="QR Code Placeholder" width={256} height={256} data-ai-hint="qrcode"/>}
                  {qrDialogStatus === "connected" && <p className="text-green-600 font-semibold">Conectado com sucesso!</p>}
                  
                  {qrDialogStatus === "idle" && <p className="text-sm text-muted-foreground">Aguardando leitura do QR Code...</p>}
                  {qrDialogStatus === "loading" && <p className="text-sm text-muted-foreground">Processando...</p>}
                  {qrDialogStatus === "error" && <p className="text-sm text-destructive">Falha ao conectar. Tente gerar um novo código.</p>}
                </div>
                <DialogFooter className="sm:justify-between">
                  <Button type="button" variant="outline" onClick={handleGenerateNewQrCode} disabled={qrDialogStatus === "loading"}>
                    Gerar Novo QR Code
                  </Button>
                  {qrDialogStatus !== "connected" ? (
                    <Button type="button" onClick={handleWhatsAppConnect} disabled={qrDialogStatus === "loading"}>
                     {qrDialogStatus === "loading" ? "Conectando..." : "Simular Conexão"}
                    </Button>
                  ) : (
                     <DialogClose asChild><Button type="button">Fechar</Button></DialogClose>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

    