
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for specialties
const specialties = ["Dentista", "Cabeleireiro", "Terapeuta", "Manicure", "Esteticista", "Personal Trainer"];

export default function AddProfessionalPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Adicionar Profissional - ${APP_NAME}`;
  }, []);

  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Basic validation
    if (!name || !email || !specialty) {
      toast({ title: "Erro", description: "Nome, e-mail e especialidade são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    // Simulate API call
    console.log("Saving professional:", { name, email, specialty, phone });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Profissional Adicionado", description: `${name} foi adicionado(a) à sua equipe.` });
    setName("");
    setEmail("");
    setSpecialty("");
    setPhone("");
    setIsSaving(false);
    // Potentially redirect or update a list elsewhere
  };

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
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Gerenciar Profissionais
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
                {/* In a real app, this might be a Select component or datalist */}
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
            
            {/* Add more fields as needed, e.g., description, photo upload, specific services offered by this professional */}
            
            <p className="text-sm text-muted-foreground">
                Após adicionar, você poderá configurar os horários de disponibilidade e serviços específicos para este profissional.
                Um convite por e-mail poderá ser enviado para que ele(a) acesse o painel de profissional.
            </p>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Profissional"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
