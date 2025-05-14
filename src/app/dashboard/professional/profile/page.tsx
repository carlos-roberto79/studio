
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, UserCog, Save, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image"; // Next.js Image

// Mock existing professional data
const mockProfessionalData = {
  name: "Dr. Alice Silva",
  email: "alice.silva@example.com", // Should come from auth context
  phone: "(21) 91234-5678",
  specialty: "Dentista",
  bio: "Especialista em ortodontia com mais de 10 anos de experiência, dedicada a criar sorrisos bonitos e saudáveis. Membro da Associação Brasileira de Odontologia.",
  profilePictureUrl: "https://placehold.co/120x120.png?text=AS",
  servicesOffered: ["Check-up Odontológico", "Clareamento Dental", "Aparelhos Ortodônticos"]
};

export default function ProfessionalProfilePage() {
  const { toast } = useToast();
  // In a real app, user email would come from useAuth()
  // const { user } = useAuth(); 
  const [name, setName] = useState(mockProfessionalData.name);
  const [email, setEmail] = useState(mockProfessionalData.email); // Could be disabled if fetched from auth
  const [phone, setPhone] = useState(mockProfessionalData.phone);
  const [specialty, setSpecialty] = useState(mockProfessionalData.specialty);
  const [bio, setBio] = useState(mockProfessionalData.bio);
  const [profilePictureUrl, setProfilePictureUrl] = useState(mockProfessionalData.profilePictureUrl);
  // For services, a more complex multi-select or tag input would be needed. Simplified for now.
  const [services, setServices] = useState(mockProfessionalData.servicesOffered.join(', '));
  
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    document.title = `Editar Meu Perfil - ${APP_NAME}`;
    // In a real app, fetch professional's data here using user.uid or similar
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    console.log("Updating professional profile:", { name, email, phone, specialty, bio, profilePictureUrl, services: services.split(',').map(s=>s.trim()) });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: "Perfil Atualizado", description: "Suas informações de perfil foram salvas." });
    setIsSaving(false);
  };

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
                <Image src={profilePictureUrl} alt="Foto do Profissional" width={120} height={120} className="rounded-full border object-cover" data-ai-hint="avatar pessoa" />
                <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2" onClick={() => alert("Funcionalidade de upload de foto a ser implementada.")}>
                  <ImageIcon className="mr-1 h-3 w-3" /> Alterar
                </Button>
              </div>
              <div className="flex-grow w-full">
                <Label htmlFor="prof-name">Seu Nome Completo</Label>
                <Input id="prof-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 text-lg font-semibold" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prof-email">E-mail de Contato (Login)</Label>
                <Input id="prof-email" type="email" value={email} disabled className="mt-1 bg-muted/50" />
                 <p className="text-xs text-muted-foreground mt-1">Para alterar o e-mail de login, contate o administrador da empresa.</p>
              </div>
              <div>
                <Label htmlFor="prof-phone">Telefone de Contato (Visível para clientes)</Label>
                <Input id="prof-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="mt-1" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="prof-specialty">Sua Especialidade Principal</Label>
              <Input id="prof-specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ex: Ortodontista, Terapeuta Holístico" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="prof-bio">Sua Biografia / Sobre Você (Visível na página de agendamento)</Label>
              <Textarea id="prof-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Descreva sua experiência, abordagem, paixões, etc." className="mt-1" rows={5} />
            </div>

            <div>
              <Label htmlFor="prof-services">Serviços que Você Oferece (separados por vírgula)</Label>
              <Input id="prof-services" value={services} onChange={(e) => setServices(e.target.value)} placeholder="Ex: Clareamento Dental, Terapia de Casal, Corte Masculino" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Estes serviços estarão disponíveis para agendamento. Detalhes como duração e preço são configurados pelo administrador da empresa.</p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações no Perfil"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
