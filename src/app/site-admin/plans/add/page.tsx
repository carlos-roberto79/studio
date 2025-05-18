
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
import { useRouter } from 'next/navigation'; // Import useRouter

// Schema de validação para o formulário de plano
const planSchema = z.object({
  nome: z.string().min(3, "O nome do plano deve ter pelo menos 3 caracteres."),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  preco: z.coerce.number().positive("O preço deve ser um valor positivo."),
  duracao: z.enum(["mensal", "anual"], { required_error: "Selecione a duração do plano." }),
  recursos: z.string().min(1, "Adicione pelo menos um recurso, um por linha."), // Tratado como string, depois array
  ativo: z.boolean().default(true),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function AddPlanPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: 0,
      duracao: "mensal",
      recursos: "",
      ativo: true,
    },
  });

  useEffect(() => {
    document.title = `Adicionar Plano - Painel Site Admin - ${APP_NAME}`;
  }, []);

  const onSubmit = async (data: PlanFormData) => {
    setIsSaving(true);
    const recursosArray = data.recursos.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const planDataToSave = {
      ...data,
      recursos: recursosArray,
    };
    console.log("BACKEND_SIM (SITE_ADMIN): Adicionando novo plano:", planDataToSave);
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Plano Adicionado (Simulação)", description: `O plano "${data.nome}" foi criado com sucesso.` });
    // Em uma aplicação real, você poderia adicionar à lista de planos ou buscar a lista atualizada.
    // Aqui, vamos redirecionar para a página de listagem de planos.
    router.push('/site-admin/plans'); 
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <PackagePlus className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Adicionar Novo Plano</CardTitle>
            <CardDescription>Preencha os detalhes do novo plano de assinatura.</CardDescription>
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
                    <FormControl><Input placeholder="Ex: Plano Profissional" {...field} /></FormControl>
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
                    <FormControl><Textarea placeholder="Uma breve descrição do que o plano oferece." {...field} rows={3} /></FormControl>
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
                      <FormControl><Input type="number" step="0.01" placeholder="99.90" {...field} /></FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione a duração" /></SelectTrigger></FormControl>
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
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Plano"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
