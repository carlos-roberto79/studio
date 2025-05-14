
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

export default function AddClientPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Adicionar Novo Cliente - ${APP_NAME}`;
  }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (!name || !email) {
      toast({ title: "Erro", description: "Nome e e-mail do cliente são obrigatórios.", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    
    // Simulate API call
    console.log("Salvando cliente:", { name, email, phone });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Cliente Adicionado", description: `${name} foi adicionado(a) à sua lista de clientes.` });
    setName("");
    setEmail("");
    setPhone("");
    setIsSaving(false);
    // Aqui você poderia redirecionar para uma lista de clientes ou de volta ao painel.
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <UserPlus className="mr-3 h-8 w-8 text-primary" /> Adicionar Novo Cliente
          </CardTitle>
          <CardDescription>Cadastre um novo cliente manualmente no sistema.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSaveClient}>
          <CardContent className="pt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="client-name">Nome Completo do Cliente</Label>
                <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria Silva" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="client-email">E-mail do Cliente</Label>
                <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: maria.silva@cliente.com" className="mt-1" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="client-phone">Telefone do Cliente (Opcional)</Label>
              <Input id="client-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: (XX) XXXXX-XXXX" className="mt-1" />
            </div>
            
            <p className="text-sm text-muted-foreground">
                Após adicionar o cliente, ele poderá ser selecionado ao criar agendamentos ou você pode enviar o link público para que ele mesmo agende.
            </p>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando Cliente..." : "Salvar Cliente"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
