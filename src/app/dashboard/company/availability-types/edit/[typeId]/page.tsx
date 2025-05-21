
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form"; // Removido useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
// * as z from "zod"; // Removido, pois availabilityTypeSchema é importado
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Input será usado no DayScheduleForm
// import { Textarea } from "@/components/ui/textarea"; // Textarea será usado no DayScheduleForm
// import { Checkbox } from "@/components/ui/checkbox"; // Checkbox será usado no DayScheduleForm
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { ArrowLeft, Save, ListChecks, Trash2, Loader2 } from "lucide-react"; // Removido PlusCircle, XCircle
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
import { availabilityTypeSchema, type AvailabilityTypeFormZodData } from '../add/page'; // Importar de add/page.tsx
import { DayScheduleForm } from '@/components/company/DayScheduleForm'; // Importar o novo componente
import { Input } from '@/components/ui/input'; // Importar Input para nome
import { Textarea } from '@/components/ui/textarea'; // Importar Textarea para descrição


const daysOfWeek = [
  { id: 'seg', label: 'Segunda-feira' },
  { id: 'ter', label: 'Terça-feira' },
  { id: 'qua', label: 'Quarta-feira' },
  { id: 'qui', label: 'Quinta-feira' },
  { id: 'sex', label: 'Sexta-feira' },
  { id: 'sab', label: 'Sábado' },
  { id: 'dom', label: 'Domingo' },
];

// Função para criar a estrutura inicial do schedule para edição, garantindo a estrutura correta para useFieldArray
const createInitialScheduleForEdit = (): AvailabilityTypeFormZodData['schedule'] => daysOfWeek.reduce((acc, day) => {
  acc[day.id as keyof AvailabilityTypeFormZodData['schedule']] = {
    active: false, 
    intervals: [{ start: "", end: "" }] // Sempre iniciar com pelo menos um intervalo
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
  const [isDataProcessed, setIsDataProcessed] = useState(false); // Flag para controlar renderização do formulário
  const [pageTitle, setPageTitle] = useState("Editar Tipo de Disponibilidade");


  const form = useForm<AvailabilityTypeFormZodData>({
    resolver: zodResolver(availabilityTypeSchema),
    defaultValues: { // Inicializa com uma estrutura válida, mas vazia/inativa.
      name: "",
      description: "",
      schedule: createInitialScheduleForEdit(), // Usa a função para garantir estrutura
    }
  });
  const formReset = form.reset; // Referência estável para form.reset

  useEffect(() => {
    let isMounted = true;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN && typeId) {
      setIsLoadingPage(true);
      setIsDataProcessed(false); // Resetar flag ao iniciar busca
      getAvailabilityTypeById(typeId)
        .then(dataFromDb => {
          if (!isMounted) return;
          if (dataFromDb) {
            setPageTitle(dataFromDb.name || "Editar Tipo de Disponibilidade");
            
            // Prepara o schedule para o form, garantindo que cada dia tenha 'intervals' como array com pelo menos um item
            const scheduleForForm: AvailabilityTypeFormZodData['schedule'] = createInitialScheduleForEdit();
            const dbSchedule = dataFromDb.schedule as any; // Cast para any para acesso flexível

            (Object.keys(scheduleForForm) as Array<keyof AvailabilityTypeFormZodData['schedule']>).forEach(dayKey => {
              const dbDaySchedule = dbSchedule?.[dayKey];
              if (dbDaySchedule) {
                scheduleForForm[dayKey].active = dbDaySchedule.active || false; // Garante boolean
                scheduleForForm[dayKey].intervals = (dbDaySchedule.intervals && Array.isArray(dbDaySchedule.intervals) && dbDaySchedule.intervals.length > 0)
                  ? dbDaySchedule.intervals.map((interval: any) => ({ 
                      start: interval.start || "", 
                      end: interval.end || "" 
                    }))
                  : [{ start: "", end: "" }]; // Se não houver intervalos ou for inválido, usa um padrão
              } else {
                 // Se o dia não existir nos dados do DB (improvável se createInitialScheduleForEdit já foi usado), inicializa
                 scheduleForForm[dayKey].active = false;
                 scheduleForForm[dayKey].intervals = [{ start: "", end: "" }];
              }
            });
            
            formReset({ // Usa a referência estável
              name: dataFromDb.name || "",
              description: dataFromDb.description || "",
              schedule: scheduleForForm,
            });
            setIsDataProcessed(true); // Sinaliza que os dados foram processados e o form pode ser renderizado
          } else {
            toast({ title: "Erro", description: `Tipo de disponibilidade com ID '${typeId}' não encontrado.`, variant: "destructive" });
            router.push('/dashboard/company/availability-types');
          }
        })
        .catch(error => {
          if (!isMounted) return;
          toast({ title: "Erro ao Carregar Tipo", description: error.message, variant: "destructive" });
          router.push('/dashboard/company/availability-types');
        })
        .finally(() => {
          if (isMounted) setIsLoadingPage(false);
        });
    } else if (!typeId) {
        toast({ title: "Erro", description: "ID do tipo de disponibilidade não fornecido.", variant: "destructive" });
        router.push('/dashboard/company/availability-types');
        if (isMounted) setIsLoadingPage(false);
    } else {
        if (isMounted) setIsLoadingPage(false); // Se não for admin ou não tiver usuário
    }

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId, user, role, router, toast, formReset]); // formReset é estável

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
      } else {
        day.intervals = [{ start: "", end: "" }]; 
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

  if (!isDataProcessed && !isLoadingPage) { // Mostrar mensagem se dados não puderam ser processados
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
    <Form {...form}> {/* FormProvider envolve tudo */}
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

        {isDataProcessed && ( // Renderizar o formulário somente após os dados serem processados
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
        )}
      </form>
    </Form>
  );
}
