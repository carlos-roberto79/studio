
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Save, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const availabilityTypeSchema = z.object({
  name: z.string().min(3, "O nome do tipo deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  rules: z.string().min(10, "Descreva as regras de disponibilidade (Ex: Seg-Sex 09:00-18:00; Intervalo 12:00-13:00)."),
});

type AvailabilityTypeFormData = z.infer<typeof availabilityTypeSchema>;

export default function AddAvailabilityTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AvailabilityTypeFormData>({
    resolver: zodResolver(availabilityTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      rules: "",
    },
  });

  useEffect(() => {
    document.title = `Adicionar Tipo de Disponibilidade - ${APP_NAME}`;
  }, []);

  const onSubmit = async (data: AvailabilityTypeFormData) => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Novo tipo de disponibilidade a ser salvo:", data);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    toast({
      title: "Tipo de Disponibilidade Adicionado (Simulação)",
      description: `O tipo "${data.name}" foi cadastrado.`,
    });
    form.reset();
    setIsSaving(false);
    router.push('/dashboard/company/availability-types');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/company/availability-types">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
                <ListChecks className="mr-3 h-7 w-7 text-primary" /> Adicionar Novo Tipo de Disponibilidade
              </CardTitle>
            </CardHeader>
          </div>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Tipo"}
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tipo de Disponibilidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Horário Comercial, Plantão de Sábado" {...field} />
                  </FormControl>
                  <FormDescription>Um nome claro para identificar este modelo de horário.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes adicionais sobre este tipo de disponibilidade." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regras de Disponibilidade (Simulação)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva as regras. Ex: Seg-Sex 09:00-18:00 com pausa 12:00-13:00; Sáb 09:00-12:00. Em um sistema real, aqui haveria uma interface mais estruturada para definir dias, horários, intervalos, recorrência, etc." 
                      rows={5} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Esta é uma simulação. A lógica para interpretar e aplicar estas regras seria complexa e gerenciada pelo backend.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
