
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Use consistent import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';

const companySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório."),
  email: z.string().email("E-mail inválido."),
  plan: z.enum(["Básico", "Pro", "Empresarial"], { required_error: "Selecione um plano." }),
  paymentStatus: z.enum(["Pago", "Pendente", "Atrasado"], { required_error: "Selecione o status do pagamento." }),
  // Adicionar mais campos conforme necessário: CNPJ, endereço, responsável, etc.
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function AddManagedCompanyPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      email: "",
      plan: "Básico",
      paymentStatus: "Pendente",
    },
  });

  useEffect(() => {
    document.title = `Adicionar Empresa - Painel Site Admin - ${APP_NAME}`;
  }, []);

  const onSubmit = async (data: CompanyFormData) => {
    setIsSaving(true);
    console.log("BACKEND_SIM (SITE_ADMIN): Adicionando nova empresa:", data);
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Empresa Adicionada (Simulação)", description: `A empresa "${data.name}" foi adicionada com sucesso.` });
    form.reset(); // Resetar o formulário
    // Idealmente, redirecionar para a lista de empresas ou para a página de edição da empresa recém-criada
    // router.push('/site-admin/companies'); 
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Adicionar Nova Empresa</CardTitle>
            <CardDescription>Insira os detalhes da nova empresa a ser gerenciada.</CardDescription>
          </CardHeader>
        </div>
        <Button variant="outline" asChild>
          <Link href="/site-admin/companies">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl><Input placeholder="Ex: Soluções Inovadoras Ltda." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail de Contato Principal</FormLabel>
                    <FormControl><Input type="email" placeholder="contato@empresa.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano Adquirido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o plano" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="Empresarial">Empresarial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Status do pagamento" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Adicionar mais campos aqui conforme necessário (CNPJ, Endereço, etc.) */}
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} size="lg">
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Empresa"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

