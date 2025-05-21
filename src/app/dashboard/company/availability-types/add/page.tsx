
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form"; // Removido useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox"; // Checkbox será usado no DayScheduleForm
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { ArrowLeft, Save, ListChecks, Loader2 } from "lucide-react"; // Removido PlusCircle, XCircle
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  // FormDescription, // Pode ser usado no DayScheduleForm se necessário
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, addAvailabilityType } from "@/services/supabaseService";
import type { AvailabilityTypeData } from "@/services/supabaseService";
import { DayScheduleForm } from '@/components/company/DayScheduleForm'; // Importar o novo componente

const daysOfWeek = [
  { id: 'seg', label: 'Segunda-feira' },
  { id: 'ter', label: 'Terça-feira' },
  { id: 'qua', label: 'Quarta-feira' },
  { id: 'qui', label: 'Quinta-feira' },
  { id: 'sex', label: 'Sexta-feira' },
  { id: 'sab', label: 'Sábado' },
  { id: 'dom', label: 'Domingo' },
];

// Schema Zod (mantido como antes, mas pode ser simplificado se a validação fina for no DayScheduleForm)
const timeIntervalSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM inválido").optional().or(z.literal("")),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM inválido").optional().or(z.literal("")),
}).refine(data => {
  if (data.start && data.end) {
    return data.start < data.end;
  }
  if (!data.start && !data.end) return true; // Ambos vazios é ok
  return !(data.start && !data.end) && !(!data.start && data.end); // Se um está preenchido, o outro também deve ser.
}, {
  message: "Se um horário (início ou fim) for preenchido, o outro também deve ser. Início deve ser antes do Fim.",
  path: ["end"], 
});

const dayScheduleSchema = z.object({
  active: z.boolean().default(false),
  intervals: z.array(timeIntervalSchema)
    .min(1, "Deve haver pelo menos um bloco de horário.") // Garantido pelo default [{start:"", end:""}]
    .default([{start: "", end: ""}]),
});

export const availabilityTypeSchema = z.object({ // Exportar para DayScheduleForm
  name: z.string().min(3, "O nome do tipo deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  schedule: z.object({
    seg: dayScheduleSchema,
    ter: dayScheduleSchema,
    qua: dayScheduleSchema,
    qui: dayScheduleSchema,
    sex: dayScheduleSchema,
    sab: dayScheduleSchema,
    dom: dayScheduleSchema,
  }),
}).refine(data => {
  for (const dayKey in data.schedule) {
    const day = data.schedule[dayKey as keyof typeof data.schedule];
    if (day.active) {
      const hasValidInterval = day.intervals.some(interval => 
        interval.start && interval.end && interval.start < interval.end
      );
      if (!hasValidInterval) {
        return false; 
      }
    }
  }
  return true;
}, { message: "Para dias ativos, pelo menos um intervalo de horário deve ser completamente preenchido e válido (Início < Fim)." });


export type AvailabilityTypeFormZodData = z.infer<typeof availabilityTypeSchema>; // Exportar para DayScheduleForm

const createInitialSchedule = (): AvailabilityTypeFormZodData['schedule'] => daysOfWeek.reduce((acc, day) => {
  const isActive = day.id !== 'sab' && day.id !== 'dom';
  acc[day.id as keyof AvailabilityTypeFormZodData['schedule']] = {
    active: isActive, 
    intervals: [{ start: isActive ? "09:00" : "", end: isActive ? "18:00" : "" }]
  };
  return acc;
}, {} as AvailabilityTypeFormZodData['schedule']);


export default function AddAvailabilityTypePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  const form = useForm<AvailabilityTypeFormZodData>({
    resolver: zodResolver(availabilityTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      schedule: createInitialSchedule(),
    },
  });

  useEffect(() => {
    document.title = `Adicionar Tipo de Disponibilidade - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada. Cadastre os detalhes da empresa primeiro.", variant: "destructive" });
        }
        setIsLoadingCompany(false);
      });
    } else {
        setIsLoadingCompany(false);
    }
  }, [user, role, toast]);

  const onSubmit = async (data: AvailabilityTypeFormZodData) => {
    if (!companyId) {
      toast({ title: "Erro", description: "ID da empresa não encontrado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    const scheduleWithFilteredIntervals = { ...data.schedule };
    for (const dayKey in scheduleWithFilteredIntervals) {
      const day = scheduleWithFilteredIntervals[dayKey as keyof typeof scheduleWithFilteredIntervals];
      if (day.active) {
        day.intervals = day.intervals.filter(interval => interval.start && interval.end);
      } else {
        day.intervals = [{ start: "", end: "" }]; 
      }
    }
    const typeDataToSave: Omit<AvailabilityTypeData, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description,
      schedule: scheduleWithFilteredIntervals,
    };

    try {
      await addAvailabilityType(companyId, typeDataToSave);
      toast({
        title: "Tipo de Disponibilidade Adicionado",
        description: `O tipo "${data.name}" foi cadastrado.`,
      });
      form.reset({ 
        name: "",
        description: "",
        schedule: createInitialSchedule(),
      });
      router.push('/dashboard/company/availability-types');
    } catch (error: any) {
      toast({ title: "Erro ao Adicionar Tipo", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingCompany) {
    return <div className="text-center p-10">Carregando dados da empresa...</div>;
  }
  if (!companyId && !isLoadingCompany) {
     return <div className="text-center p-10 text-destructive">Não foi possível carregar os dados da empresa. Verifique se o perfil da empresa está completo.</div>;
  }

  return (
    <Form {...form}> {/* FormProvider envolve tudo */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" asChild type="button">
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
          <Button type="submit" disabled={isSaving || isLoadingCompany}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Horário Semanal Padrão</CardTitle>
                <CardDescription>Defina os horários para cada dia da semana para este tipo de disponibilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => (
                  <DayScheduleForm
                    key={day.id}
                    dayKey={day.id as keyof AvailabilityTypeFormZodData['schedule']}
                    dayLabel={day.label}
                  />
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
