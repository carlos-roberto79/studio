
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
import { useParams, useRouter } from "next/navigation";
import type { Plan } from '@/lib/types'; // Importando o tipo Plan

const initialMockPlans: Plan[] = [
  { id: "plan_basic_01", nome: "Plano Básico", descricao: "Ideal para começar.", preco: 49.90, duracao: "mensal", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
  { id: "plan_pro_02", nome: "Plano Profissional", descricao: "Para negócios em crescimento.", preco: 99.90, duracao: "mensal", recursos: ["5 Profissionais", "500 Agendamentos/mês", "Notificações IA", "Página da Empresa"], ativo: true },
  { id: "plan_premium_03", nome: "Plano Premium", descricao: "Solução completa para grandes empresas.", preco: 199.90, duracao: "mensal", recursos: ["Profissionais Ilimitados", "Agendamentos Ilimitados", "Suporte Prioritário", "API de Integração"], ativo: false },
  { id: "plan_anual_basic_04", nome: "Plano Básico Anual", descricao: "Economize com o plano anual.", preco: 499.00, duracao: "anual", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
];

// Schema de validação para o formulário de plano
const planSchema = z.object({
  nome: z.string().min(3, "O nome do plano deve ter pelo menos 3 caracteres."),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  preco: z.coerce.number().positive("O preço deve ser um valor positivo."),
  duracao: z.enum(["mensal", "anual"], { required_error: "Selecione a duração do plano." }),
  recursos: z.string().min(1, "Adicione pelo menos um recurso, um por linha."),
  ativo: z.boolean().default(true),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function EditPlanPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanName, setCurrentPlanName] = useState<string>("Carregando...");
  
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    // Default values serão carregados no useEffect
  });

  useEffect(() => {
    // Simula o carregamento dos dados do plano
    setIsLoading(true);
    const planToEdit = initialMockPlans.find(p => p.id === planId);
    if (planToEdit) {
      form.reset({
        ...planToEdit,
        recursos: planToEdit.recursos.join('\n'), // Converte array para string para o textarea
      });
      setCurrentPlanName(planToEdit.nome);
      document.title = `Editar: ${planToEdit.nome} - Painel Site Admin - ${APP_NAME}`;
    } else {
      toast({ title: "Erro", description: "Plano não encontrado.", variant: "destructive" });
      router.push("/site-admin/plans"); 
    }
    setIsLoading(false);
  }, [planId, form, router, toast]);

  const onSubmit = async (data: PlanFormData) => {
    setIsSaving(true);
    const recursosArray = data.recursos.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const planDataToUpdate = {
      id: planId, // Inclui o ID para a simulação de atualização
      ...data,
      recursos: recursosArray,
    };
    console.log("BACKEND_SIM (SITE_ADMIN): Atualizando plano:", planDataToUpdate);
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Plano Atualizado (Simulação)", description: `O plano "${data.nome}" foi atualizado com sucesso.` });
    router.push('/site-admin/plans'); 
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados do plano...</p></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PackagePlus className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Editar Plano: {currentPlanName}</CardTitle>
            <CardDescription>Modifique os detalhes do plano selecionado.</CardDescription>
          </CardHeader>
        </div>
        <Button variant="outline" asChild>
          <Link href="/site-admin/plans">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Planos
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Curta</FormLabel>
                    <FormControl><Textarea {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duracao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="recursos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recursos Incluídos</FormLabel>
                    <FormControl><Textarea placeholder="Digite um recurso por linha..." {...field} rows={5} /></FormControl>
                    <FormDescription>Cada linha será um item na lista de recursos do plano.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Plano Ativo</FormLabel>
                      <FormDescription>
                        Se marcado, o plano estará disponível para novas assinaturas.
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
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando Alterações..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
