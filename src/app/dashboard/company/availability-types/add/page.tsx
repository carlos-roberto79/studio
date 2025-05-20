
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { ArrowLeft, Save, ListChecks, PlusCircle, XCircle, Loader2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, addAvailabilityType } from "@/services/supabaseService";
import type { AvailabilityTypeData } from "@/services/supabaseService";

const daysOfWeek = [
  { id: 'seg', label: 'Segunda-feira' },
  { id: 'ter', label: 'Terça-feira' },
  { id: 'qua', label: 'Quarta-feira' },
  { id: 'qui', label: 'Quinta-feira' },
  { id: 'sex', label: 'Sexta-feira' },
  { id: 'sab', label: 'Sábado' },
  { id: 'dom', label: 'Domingo' },
];

const timeIntervalSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM inválido").optional().or(z.literal("")),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM inválido").optional().or(z.literal("")),
}).refine(data => {
  if ((data.start && !data.end) || (!data.start && data.end)) return false; 
  if (data.start && data.end) {
    return data.start < data.end;
  }
  return true;
}, {
  message: "Início deve ser antes do Fim e ambos devem ser preenchidos se um deles estiver.",
  path: ["end"],
});

const dayScheduleSchema = z.object({
  active: z.boolean().default(false),
  intervals: z.array(timeIntervalSchema)
    .min(1, "Deve haver pelo menos um bloco de horário (pode estar vazio se o dia estiver inativo).")
    .default([{start: "", end: ""}]),
});

const availabilityTypeSchema = z.object({
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
      const hasValidInterval = day.intervals.some(interval => interval.start && interval.end && interval.start < interval.end);
      if (!hasValidInterval) {
        return false;
      }
    }
  }
  return true;
}, { message: "Para dias ativos, pelo menos um intervalo de horário deve ser completamente preenchido (início e fim, com início antes do fim)." });


type AvailabilityTypeFormZodData = z.infer<typeof availabilityTypeSchema>;

const createInitialSchedule = (): AvailabilityTypeFormZodData['schedule'] => daysOfWeek.reduce((acc, day) => {
  const isActive = day.id !== 'sab' && day.id !== 'dom';
  acc[day.id as keyof AvailabilityTypeFormZodData['schedule']] = {
    active: isActive, 
    intervals: isActive ? [{ start: "09:00", end: "18:00" }] : [{ start: "", end: "" }]
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
         if (day.intervals.length === 0) { // Ensure at least one empty interval if active but all cleared
            day.intervals.push({start: "", end: ""});
        }
      } else {
        day.intervals = [{ start: "", end: "" }]; // Reset to one empty if not active
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
    <Form {...form}>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Horário Semanal Padrão</CardTitle>
                <CardDescription>Defina os horários para cada dia da semana para este tipo de disponibilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayKey = day.id as keyof AvailabilityTypeFormZodData['schedule'];
                  const { fields, append, remove } = useFieldArray({
                    control: form.control,
                    name: `schedule.${dayKey}.intervals`
                  });

                  return (
                    <div key={day.id} className="p-4 border rounded-md space-y-3">
                      <FormField
                        control={form.control}
                        name={`schedule.${dayKey}.active`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  if (checked && fields.length === 0) {
                                    append({ start: "09:00", end: "18:00" });
                                  } else if (!checked && fields.length > 1) {
                                    // Ao desativar, se houver múltiplos intervalos, reseta para um intervalo vazio
                                    // fields.forEach((_, index) => remove(index)); // Causa erro de "too many re-renders"
                                    form.setValue(`schedule.${dayKey}.intervals`, [{start: "", end: ""}]);
                                  } else if (!checked && fields.length === 1) {
                                    form.setValue(`schedule.${dayKey}.intervals.0.start`, "");
                                    form.setValue(`schedule.${dayKey}.intervals.0.end`, "");
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-semibold text-md">{day.label}</FormLabel>
                          </FormItem>
                        )}
                      />

                      {form.watch(`schedule.${dayKey}.active`) && (
                        <div className="space-y-2 pl-6">
                          {fields.map((intervalField, index) => (
                            <div key={intervalField.id} className="flex items-end gap-2">
                              <FormField
                                control={form.control}
                                name={`schedule.${dayKey}.intervals.${index}.start`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel className="text-xs">Início</FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`schedule.${dayKey}.intervals.${index}.end`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel className="text-xs">Fim</FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="text-destructive hover:text-destructive"
                                title="Remover horário"
                                disabled={fields.length <= 1}
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ start: "", end: "" })}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Horário
                          </Button>
                        </div>
                      )}
                       <FormMessage>{form.formState.errors.schedule?.[dayKey]?.intervals?.root?.message}</FormMessage>
                       {fields.map((_, index) => ( 
                        <React.Fragment key={`${dayKey}-intervals-errors-${index}`}>
                          <FormMessage>{form.formState.errors.schedule?.[dayKey]?.intervals?.[index]?.start?.message}</FormMessage>
                          <FormMessage>{form.formState.errors.schedule?.[dayKey]?.intervals?.[index]?.end?.message}</FormMessage>
                          <FormMessage>{form.formState.errors.schedule?.[dayKey]?.intervals?.[index]?.root?.message}</FormMessage>
                        </React.Fragment>
                       ))}
                       <FormMessage>{form.formState.errors.schedule?.[dayKey]?.root?.message}</FormMessage>
                       <FormMessage>{form.formState.errors.schedule?.root?.message}</FormMessage> 
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

    