
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
import { ArrowLeft, Save, ListChecks, Trash2, PlusCircle, XCircle, Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getAvailabilityTypeById, updateAvailabilityType, deleteAvailabilityType } from "@/services/supabaseService";
import type { AvailabilityTypeData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";


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
  if (data.start && !data.end) return false;
  if (!data.start && data.end) return false;
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
    .default([{start: "", end: ""}]), // Garante que sempre haja um item no array
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
        return false; // Se o dia está ativo, pelo menos um intervalo deve ser válido
      }
    }
  }
  return true;
}, { message: "Para dias ativos, pelo menos um intervalo de horário deve ser completamente preenchido (início e fim, com início antes do fim)." });


type AvailabilityTypeFormZodData = z.infer<typeof availabilityTypeSchema>;

const createInitialScheduleForEdit = (): AvailabilityTypeFormZodData['schedule'] => daysOfWeek.reduce((acc, day) => {
  acc[day.id as keyof AvailabilityTypeFormZodData['schedule']] = {
    active: false, // Começa inativo até os dados serem carregados
    intervals: [{ start: "", end: "" }] // Apenas um intervalo inicial vazio
  };
  return acc;
}, {} as AvailabilityTypeFormZodData['schedule']);


export default function EditAvailabilityTypePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const typeId = params.typeId as string;
  const { user, role } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [pageTitle, setPageTitle] = useState("Editar Tipo de Disponibilidade");

  const form = useForm<AvailabilityTypeFormZodData>({
    resolver: zodResolver(availabilityTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      schedule: createInitialScheduleForEdit(), // Usa uma função que inicializa com dias inativos
    }
  });
  const formReset = form.reset; // Estabiliza a referência

  useEffect(() => {
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN && typeId) {
      fetchTypeData(typeId);
    } else if (!typeId) {
        toast({ title: "Erro", description: "ID do tipo de disponibilidade não fornecido.", variant: "destructive" });
        router.push('/dashboard/company/availability-types');
        setIsLoadingPage(false);
    } else {
        setIsLoadingPage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId, user, role, router, toast]); 

  const fetchTypeData = async (currentTypeId: string) => {
    setIsLoadingPage(true);
    setIsDataProcessed(false);
    try {
      const dataFromDb = await getAvailabilityTypeById(currentTypeId);
      if (dataFromDb) {
        setPageTitle(dataFromDb.name || "Editar Tipo de Disponibilidade");
        
        const scheduleForForm: AvailabilityTypeFormZodData['schedule'] = createInitialScheduleForEdit();
        const dbSchedule = dataFromDb.schedule as any; 

        (Object.keys(scheduleForForm) as Array<keyof AvailabilityTypeFormZodData['schedule']>).forEach(dayKey => {
          const dbDaySchedule = dbSchedule?.[dayKey];
          if (dbDaySchedule) {
            scheduleForForm[dayKey].active = dbDaySchedule.active;
            scheduleForForm[dayKey].intervals = (dbDaySchedule.intervals && Array.isArray(dbDaySchedule.intervals) && dbDaySchedule.intervals.length > 0)
              ? dbDaySchedule.intervals.map((interval: any) => ({ 
                  start: interval.start || "", 
                  end: interval.end || "" 
                }))
              : [{ start: "", end: "" }]; 
          } else {
             // Mantém o padrão de createInitialScheduleForEdit (dia inativo com um intervalo vazio)
             scheduleForForm[dayKey].active = false;
             scheduleForForm[dayKey].intervals = [{ start: "", end: "" }];
          }
        });
        
        formReset({ 
          name: dataFromDb.name || "",
          description: dataFromDb.description || "",
          schedule: scheduleForForm,
        });
        setIsDataProcessed(true); 
      } else {
        toast({ title: "Erro", description: `Tipo de disponibilidade com ID '${currentTypeId}' não encontrado.`, variant: "destructive" });
        router.push('/dashboard/company/availability-types');
      }
    } catch (error: any) {
      toast({ title: "Erro ao Carregar Tipo", description: error.message, variant: "destructive" });
      router.push('/dashboard/company/availability-types');
    } finally {
      setIsLoadingPage(false);
    }
  };


  useEffect(() => {
    if (pageTitle && !isLoadingPage) {
      document.title = `Editar: ${pageTitle} - ${APP_NAME}`;
    }
  }, [pageTitle, isLoadingPage]);

  const onSubmit = async (data: AvailabilityTypeFormZodData) => {
    setIsSaving(true);
    const scheduleWithFilteredIntervals = { ...data.schedule };
    for (const dayKey in scheduleWithFilteredIntervals) {
      const day = scheduleWithFilteredIntervals[dayKey as keyof typeof scheduleWithFilteredIntervals];
      if (day.active) {
        day.intervals = day.intervals.filter(interval => interval.start && interval.end);
         if (day.intervals.length === 0) {
            // O refine do Zod deve pegar isso se o dia estiver ativo.
            // Para consistência de dados, podemos forçar um intervalo vazio se a intenção é "limpar" um dia ativo.
            // day.intervals.push({start: "", end: ""});
        }
      } else {
        day.intervals = [{ start: "", end: "" }]; // Garante um array com um item vazio se inativo
      }
    }
    const typeDataToUpdate: Partial<Omit<AvailabilityTypeData, 'id' | 'company_id' | 'created_at' | 'updated_at'>> = {
      name: data.name,
      description: data.description,
      schedule: scheduleWithFilteredIntervals,
    };

    try {
      await updateAvailabilityType(typeId, typeDataToUpdate);
      toast({
        title: "Tipo Atualizado",
        description: `O tipo "${data.name}" foi atualizado.`,
      });
      router.push('/dashboard/company/availability-types');
    } catch (error: any) {
      toast({ title: "Erro ao Atualizar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteAvailabilityType(typeId);
      toast({
        title: "Tipo Excluído",
        description: `O tipo "${form.getValues("name")}" foi excluído.`,
      });
      router.push('/dashboard/company/availability-types');
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingPage) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between"><Skeleton className="h-10 w-3/5" /><Skeleton className="h-9 w-24" /></div>
            <Card className="shadow-lg"><CardContent className="pt-6 space-y-6">
                {[...Array(3)].map((_,i) => <div key={i} className="space-y-2"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-10 w-full" /></div>)}
                <Skeleton className="h-64 w-full"/>
                <div className="flex justify-end"><Skeleton className="h-10 w-32" /></div>
            </CardContent></Card>
        </div>
    );
  }

  if (!isDataProcessed && !isLoadingPage) { 
     return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-xl text-destructive">Não foi possível carregar os dados do tipo de disponibilidade.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/availability-types">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
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
             <Button variant="outline" size="icon" asChild type="button">
                <Link href="/dashboard/company/availability-types">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl font-bold flex items-center">
                <ListChecks className="mr-3 h-7 w-7 text-primary" /> Editar: {form.watch("name") || "Tipo de Disponibilidade"}
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
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {isDataProcessed && (
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

                <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Horário Semanal Padrão</CardTitle>
                    <CardDescription>Defina os horários para cada dia da semana para este tipo de disponibilidade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {daysOfWeek.map((day) => {
                    const dayKey = day.id as keyof AvailabilityTypeFormZodData['schedule'];
                    const { fields, append, remove, update } = useFieldArray({
                        control: form.control,
                        name: `schedule.${dayKey}.intervals`
                    });

                    return (
                        <div key={day.id} className="p-4 border rounded-md space-y-3">
                        <FormField
                            control={form.control}
                            name={`schedule.${dayKey}.active`}
                            render={({ field: dayActiveField }) => ( // Renomeado para evitar conflito
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={dayActiveField.value}
                                    onCheckedChange={(checked) => {
                                        dayActiveField.onChange(checked);
                                        if (checked && fields.length > 0) {
                                            const firstInterval = fields[0];
                                            if (!firstInterval.start && !firstInterval.end) {
                                                update(0, { start: "09:00", end: "18:00"});
                                            }
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
                        {/* Mensagens de erro globais para o array de intervalos ou para o dia */}
                        <FormMessage>{form.formState.errors.schedule?.[dayKey]?.intervals?.root?.message}</FormMessage>
                        <FormMessage>{form.formState.errors.schedule?.[dayKey]?.root?.message}</FormMessage>
                        {/* Mensagem de erro global do Zod refine para o schedule */}
                        {dayKey === 'seg' && <FormMessage>{form.formState.errors.schedule?.root?.message}</FormMessage>}
                        </div>
                    );
                    })}
                </CardContent>
                </Card>
            </CardContent>
            </Card>
        )}
      </form>
    </Form>
  );
}
    