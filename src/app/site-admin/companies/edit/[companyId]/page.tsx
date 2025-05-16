
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';

interface ManagedCompany {
  id: string;
  name: string;
  email: string;
  paymentStatus: "Pago" | "Pendente" | "Atrasado";
  plan: "Básico" | "Pro" | "Empresarial";
  isBlocked: boolean;
}

// Mock de dados para encontrar a empresa a ser editada
const mockManagedCompanies: ManagedCompany[] = [
  { id: "comp1", name: "Salão Cortes Modernos", email: "contato@cortesmodernos.com", paymentStatus: "Pago", plan: "Pro", isBlocked: false },
  { id: "comp2", name: "Clínica Sorriso Feliz", email: "adm@sorrisofeliz.com", paymentStatus: "Pendente", plan: "Básico", isBlocked: false },
  { id: "comp3", name: "Academia Corpo em Movimento", email: "financeiro@corpoemmovimento.com", paymentStatus: "Atrasado", plan: "Empresarial", isBlocked: true },
];


const companySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório."),
  email: z.string().email("E-mail inválido."),
  plan: z.enum(["Básico", "Pro", "Empresarial"], { required_error: "Selecione um plano." }),
  paymentStatus: z.enum(["Pago", "Pendente", "Atrasado"], { required_error: "Selecione o status do pagamento." }),
  isBlocked: z.boolean().default(false),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function EditManagedCompanyPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    // Default values serão carregados no useEffect
  });

  useEffect(() => {
    // Simula o carregamento dos dados da empresa
    const companyToEdit = mockManagedCompanies.find(c => c.id === companyId);
    if (companyToEdit) {
      form.reset(companyToEdit); // Preenche o formulário com os dados mockados
      document.title = `Editar: ${companyToEdit.name} - Painel Site Admin - ${APP_NAME}`;
    } else {
      toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
      router.push("/site-admin/companies"); // Redireciona se não encontrar
    }
    setIsLoading(false);
  }, [companyId, form, router, toast]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsSaving(true);
    console.log("BACKEND_SIM (SITE_ADMIN): Atualizando empresa:", { companyId, data });
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Empresa Atualizada (Simulação)", description: `A empresa "${data.name}" foi atualizada com sucesso.` });
    setIsSaving(false);
    router.push('/site-admin/companies');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados da empresa...</p></div>;
  }
  
  const companyName = form.watch("name");

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Editar Empresa: {companyName || "Carregando..."}</CardTitle>
            <CardDescription>Modifique os detalhes da empresa selecionada.</CardDescription>
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
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input type="email" {...field} /></FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
              <FormField
                control={form.control}
                name="isBlocked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Bloquear Empresa</FormLabel>
                      <FormDescription>
                        Impede o acesso da empresa e seus usuários ao sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} size="lg">
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
