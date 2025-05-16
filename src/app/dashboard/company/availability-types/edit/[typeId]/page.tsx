
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
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Save, ListChecks, Trash2, PlusCircle, XCircle } from "lucide-react";
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
  if (data.start && !data.end) return false; // Se tem início, precisa de fim
  if (!data.start && data.end) return false; // Se tem fim, precisa de início
  if (data.start && data.end) {
    return data.start < data.end;
  }
  return true;
}, {
  message: "Início deve ser antes do Fim e ambos devem ser preenchidos se um deles estiver.",
  path: ["end"], // Ou path: ["start"]
});

const dayScheduleSchema = z.object({
  active: z.boolean().default(false),
  intervals: z.array(timeIntervalSchema)
    .min(1, "Deve haver pelo menos um bloco de horário (pode estar vazio).")
    .default([{start: "", end: ""}]), // Garante que sempre haja um item, mesmo que vazio
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
  // Validação global para dias ativos:
  for (const dayKey in data.schedule) {
    const day = data.schedule[dayKey as keyof typeof data.schedule];
    if (day.active) {
      const hasValidInterval = day.intervals.some(interval => interval.start && interval.end);
      if (!hasValidInterval) {
        // Se o dia está ativo, pelo menos um intervalo deve ser completamente preenchido.
        // Este erro será mais difícil de associar a um campo específico no Zod.
        // A validação individual do timeIntervalSchema já cuida de start/end juntos.
        // Poderia adicionar um `path` aqui, mas seria genérico.
        return false;
      }
    }
  }
  return true;
}, { message: "Para dias ativos, pelo menos um intervalo de horário deve ser completamente preenchido (início e fim)." });


type AvailabilityTypeFormData = z.infer<typeof availabilityTypeSchema>;

const createInitialSchedule = (): AvailabilityTypeFormData['schedule'] => daysOfWeek.reduce((acc, day) => {
  acc[day.id as keyof AvailabilityTypeFormData['schedule']] = {
    active: day.id !== 'sab' && day.id !== 'dom',
    intervals: [{ start: "09:00", end: "18:00" }]
  };
  return acc;
}, {} as AvailabilityTypeFormData['schedule']);


const mockExistingAvailabilityTypes: { [key: string]: AvailabilityTypeFormData } = {
  "type1": {
    name: "Horário Comercial Padrão",
    description: "Segunda a Sexta, das 9h às 18h, com pausa para almoço.",
    schedule: {
      seg: { active: true, intervals: [{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}]},
      ter: { active: true, intervals: [{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}]},
      qua: { active: true, intervals: [{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}]},
      qui: { active: true, intervals: [{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}]},
      sex: { active: true, intervals: [{start: "09:00", end: "12:00"}, {start: "13:00", end: "18:00"}]},
      sab: { active: false, intervals: [{start: "", end: ""}]},
      dom: { active: false, intervals: [{start: "", end: ""}]},
    }
  },
  "type2": {
    name: "Plantão Final de Semana",
    description: "Sábados e Domingos, horários específicos sob demanda. Contatar para agendar.",
    schedule: {
      ...(createInitialSchedule()), // Start with a full base
      seg: { active: false, intervals: [{start: "", end: ""}] },
      ter: { active: false, intervals: [{start: "", end: ""}] },
      qua: { active: false, intervals: [{start: "", end: ""}] },
      qui: { active: false, intervals: [{start: "", end: ""}] },
      sex: { active: false, intervals: [{start: "", end: ""}] },
      sab: { active: true, intervals: [{start: "10:00", end: "14:00"}]},
      dom: { active: false, intervals: [{start: "", end: ""}]},
    }
  },
   "type3": {
    name: "Horário Noturno Reduzido",
    description: "Segunda a Quinta, das 18h às 21h.",
    schedule: {
      ...(createInitialSchedule()), // Start with a full base
      seg: { active: true, intervals: [{start: "18:00", end: "21:00"}]},
      ter: { active: true, intervals: [{start: "18:00", end: "21:00"}]},
      qua: { active: true, intervals: [{start: "18:00", end: "21:00"}]},
      qui: { active: true, intervals: [{start: "18:00", end: "21:00"}]},
      sex: { active: false, intervals: [{start: "", end: ""}]},
      sab: { active: false, intervals: [{start: "", end: ""}]},
      dom: { active: false, intervals: [{start: "", end: ""}]},
    }
  },
};

export default function EditAvailabilityTypePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const typeId = params.typeId as string;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("Editar Tipo de Disponibilidade");


  const form = useForm<AvailabilityTypeFormData>({
    resolver: zodResolver(availabilityTypeSchema),
    defaultValues: { // Default values must match the schema structure
      name: "",
      description: "",
      schedule: createInitialSchedule(),
    }
  });

  useEffect(() => {
    setIsLoading(true);
    if (typeId) {
      const dataFromMock = mockExistingAvailabilityTypes[typeId];
      if (dataFromMock) {
        setPageTitle(dataFromMock.name || "Editar Tipo de Disponibilidade");
        // Prepare the schedule data for form.reset, ensuring it matches Zod schema requirements
        const scheduleForForm: AvailabilityTypeFormData['schedule'] = { ...createInitialSchedule() };

        (Object.keys(scheduleForForm) as Array<keyof AvailabilityTypeFormData['schedule']>).forEach(dayKey => {
          if (dataFromMock.schedule && dataFromMock.schedule[dayKey]) {
            const mockDay = dataFromMock.schedule[dayKey];
            scheduleForForm[dayKey].active = mockDay.active;
            // Ensure 'intervals' is always an array with at least one item
            scheduleForForm[dayKey].intervals = (mockDay.intervals && mockDay.intervals.length > 0)
              ? mockDay.intervals
              : [{ start: "", end: "" }];
          }
        });
        
        form.reset({
          name: dataFromMock.name,
          description: dataFromMock.description,
          schedule: scheduleForForm,
        });

      } else {
        toast({ title: "Erro", description: `Tipo de disponibilidade com ID '${typeId}' não encontrado.`, variant: "destructive" });
        router.push('/dashboard/company/availability-types');
      }
    } else {
       toast({ title: "Erro", description: "ID do tipo de disponibilidade não fornecido.", variant: "destructive" });
       router.push('/dashboard/company/availability-types');
    }
    setIsLoading(false);
  }, [typeId, form, router, toast]);

  useEffect(() => {
    if (pageTitle) {
      document.title = `Editar: ${pageTitle} - ${APP_NAME}`;
    }
  }, [pageTitle]);

  const onSubmit = async (data: AvailabilityTypeFormData) => {
    setIsSaving(true);
    const scheduleWithFilteredIntervals = { ...data.schedule };
    for (const dayKey in scheduleWithFilteredIntervals) {
      const day = scheduleWithFilteredIntervals[dayKey as keyof typeof scheduleWithFilteredIntervals];
      if (day.active) {
        day.intervals = day.intervals.filter(interval => interval.start && interval.end);
        if (day.intervals.length === 0) {
          // This case should be prevented by the global refine or individual interval validation
          // For safety, if a day is active and somehow all intervals are invalid/empty, set it inactive.
          // day.active = false;
          // day.intervals = [{ start: "", end: "" }];
          // Or, rely on Zod validation to catch this (as it should with the global refine).
        }
      } else {
        day.intervals = [{ start: "", end: "" }];
      }
    }
    const finalData = { ...data, schedule: scheduleWithFilteredIntervals };

    console.log("BACKEND_SIM: Tipo de disponibilidade a ser atualizado:", { typeId, data: finalData });
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Horário Semanal Padrão</CardTitle>
                <CardDescription>Defina os horários para cada dia da semana para este tipo de disponibilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day, dayIndex) => {
                  const dayKey = day.id as keyof AvailabilityTypeFormData['schedule'];
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
                       <FormMessage>{form.formState.errors.schedule?.[dayKey]?.message}</FormMessage>
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

    