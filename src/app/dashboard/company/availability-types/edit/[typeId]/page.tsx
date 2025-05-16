
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
import { ArrowLeft, Save, ListChecks, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const availabilityTypeSchema = z.object({
  name: z.string().min(3, "O nome do tipo deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  rules: z.string().min(10, "Descreva as regras de disponibilidade (Ex: Seg-Sex 09:00-18:00; Intervalo 12:00-13:00)."),
});

type AvailabilityTypeFormData = z.infer<typeof availabilityTypeSchema>;

// Mock para simular a busca de um tipo existente
const mockExistingAvailabilityTypes: { [key: string]: AvailabilityTypeFormData } = {
  "type1": { name: "Horário Comercial Padrão", description: "Segunda a Sexta, das 9h às 18h, com pausa para almoço.", rules: "Seg-Sex 09:00-18:00 (Almoço 12-13h)"},
  "type2": { name: "Plantão Final de Semana", description: "Sábados e Domingos, horários específicos sob demanda.", rules: "Sáb/Dom - Flexível. Contatar para agendar." },
};

export default function EditAvailabilityTypePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const typeId = params.typeId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AvailabilityTypeFormData>({
    resolver: zodResolver(availabilityTypeSchema),
  });
  
  const typeName = form.watch("name");

  useEffect(() => {
    if (typeId) {
      console.log(`BACKEND_SIM: Buscando tipo de disponibilidade com ID: ${typeId}`);
      const existingType = mockExistingAvailabilityTypes[typeId];
      if (existingType) {
        form.reset(existingType);
        setIsLoading(false);
      } else {
        toast({ title: "Erro", description: "Tipo de disponibilidade não encontrado.", variant: "destructive" });
        setIsLoading(false); 
        router.push('/dashboard/company/availability-types');
      }
    } else {
        setIsLoading(false); 
    }
  }, [typeId, form, toast, router]);
  
  useEffect(() => {
    if (typeName) {
      document.title = `Editar: ${typeName} - ${APP_NAME}`;
    } else {
      document.title = `Editar Tipo de Disponibilidade - ${APP_NAME}`;
    }
  }, [typeName]);

  const onSubmit = async (data: AvailabilityTypeFormData) => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Tipo de disponibilidade a ser atualizado:", { typeId, data });
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Tipo Atualizado (Simulação)",
      description: `O tipo "${data.name}" foi atualizado.`,
    });
    setIsSaving(false);
    router.push('/dashboard/company/availability-types');
  };

  const handleDelete = async () => {
    setIsSaving(true); 
    console.log("BACKEND_SIM: Solicitação de exclusão para o tipo de disponibilidade ID:", typeId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Tipo Excluído (Simulação)",
      description: `O tipo "${form.getValues("name")}" foi excluído.`,
    });
    router.push('/dashboard/company/availability-types');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados...</p></div>;
  }
   if (!isLoading && !mockExistingAvailabilityTypes[typeId] && typeId) {
     return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-xl text-destructive">Tipo de disponibilidade com ID '{typeId}' não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/availability-types">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Tipos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/company/availability-types">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
                <ListChecks className="mr-3 h-7 w-7 text-primary" /> Editar: {typeName || "Tipo de Disponibilidade"}
              </CardTitle>
            </CardHeader>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isSaving}><Trash2 className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Excluir</span></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o tipo "{form.getValues("name")}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
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
                    <Input {...field} />
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
                    <Textarea rows={3} {...field} />
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
                      placeholder="Descreva as regras. Ex: Seg-Sex 09:00-18:00 com pausa 12:00-13:00; Sáb 09:00-12:00." 
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
