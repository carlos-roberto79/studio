
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, CalendarOff, Ban, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME, USER_ROLES } from '@/lib/constants';
import { useParams, useRouter } from "next/navigation";
import type { AgendaBlockData as AgendaBlockFormDataFromService, MockConflictingAppointment } from '@/lib/types'; // Renomeado
import { agendaBlockSchema } from '@/lib/types'; 
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, getAgendaBlockById, updateAgendaBlock, getProfessionalsForSelect } from "@/services/supabaseService";
import { format } from 'date-fns'; // Para formatar data do datetime-local
import { Skeleton } from '@/components/ui/skeleton';


const MOCK_EXISTING_APPOINTMENTS_EDIT: MockConflictingAppointment[] = [
  { id: "apptEdit1", clienteNome: "Laura P.", dataHora: "27/07/2024 15:00", servico: "Manicure" },
  { id: "apptEdit2", clienteNome: "Pedro S.", dataHora: "27/07/2024 16:00", servico: "Corte Masculino" },
];


export default function EditAgendaBlockPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const blockId = params.blockId as string;
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [currentBlockReason, setCurrentBlockReason] = useState<string>("Carregando...");

  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<MockConflictingAppointment[]>([]);
  const [formDataForConflict, setFormDataForConflict] = useState<AgendaBlockFormDataFromService | null>(null);
  
  const form = useForm<AgendaBlockFormDataFromService>({
    resolver: zodResolver(agendaBlockSchema),
  });
  
  const watchTargetType = form.watch("target_type");

  useEffect(() => {
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
          fetchProfessionals(companyDetails.id);
          if (blockId) {
            fetchBlockData(blockId);
          } else {
            toast({ title: "Erro", description: "ID do bloqueio não fornecido.", variant: "destructive" });
            router.push("/dashboard/company/agenda-blocks");
            setIsLoadingPage(false);
          }
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
          setIsLoadingPage(false);
          router.push("/dashboard/company");
        }
      });
    } else {
      setIsLoadingPage(false);
       router.push("/login");
    }
  }, [user, role, blockId, router, toast]); // form não é mais dependência direta aqui

  const fetchProfessionals = async (currentCompanyId: string) => {
    try {
      const profs = await getProfessionalsForSelect(currentCompanyId);
      setProfessionals(profs);
    } catch (error: any) {
      toast({ title: "Erro ao buscar profissionais", description: error.message, variant: "destructive" });
    }
  };

  const fetchBlockData = async (currentBlockId: string) => {
    setIsLoadingPage(true);
    try {
      const blockToEdit = await getAgendaBlockById(currentBlockId);
      if (blockToEdit) {
        // Formatar datas para datetime-local
        const startTimeFormatted = blockToEdit.start_time ? format(new Date(blockToEdit.start_time), "yyyy-MM-dd'T'HH:mm") : "";
        const endTimeFormatted = blockToEdit.end_time ? format(new Date(blockToEdit.end_time), "yyyy-MM-dd'T'HH:mm") : "";

        form.reset({
            ...blockToEdit,
            start_time: startTimeFormatted,
            end_time: endTimeFormatted,
            professional_id: blockToEdit.professional_id || "", // Garantir que é string para o Select
        });
        setCurrentBlockReason(blockToEdit.reason);
        document.title = `Editar Bloqueio: ${blockToEdit.reason} - ${APP_NAME}`;
      } else {
        toast({ title: "Erro", description: "Bloqueio não encontrado.", variant: "destructive" });
        router.push("/dashboard/company/agenda-blocks");
      }
    } catch (error: any) {
        toast({ title: "Erro ao Carregar Bloqueio", description: error.message, variant: "destructive" });
        router.push("/dashboard/company/agenda-blocks");
    } finally {
        setIsLoadingPage(false);
    }
  };


  const simulateConflictCheck = (blockData: AgendaBlockFormDataFromService): MockConflictingAppointment[] => {
    if (blockData.reason.toLowerCase().includes("urgente") || blockData.start_time.includes("2024-07-27")) {
      return MOCK_EXISTING_APPOINTMENTS_EDIT;
    }
    return [];
  };

  const handleActualSave = async (data: AgendaBlockFormDataFromService) => {
    setIsSaving(true);
    try {
      await updateAgendaBlock(blockId, data);
      toast({ title: "Bloqueio Atualizado", description: `O bloqueio "${data.reason}" foi atualizado.` });

      if (conflictingAppointments.length > 0 && formDataForConflict) {
          toast({
              title: "Agendamentos Cancelados (Simulação)",
              description: `${conflictingAppointments.length} agendamento(s) conflitante(s) foram cancelados e os clientes notificados.`,
              variant: "destructive"
          });
      }
      setConflictingAppointments([]);
      setFormDataForConflict(null);
      router.push('/dashboard/company/agenda-blocks');
    } catch (error: any) {
      toast({ title: "Erro ao Atualizar Bloqueio", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: AgendaBlockFormDataFromService) => {
    setIsSaving(true);
    const conflicts = simulateConflictCheck(data);
    setIsSaving(false);

    if (conflicts.length > 0) {
      setConflictingAppointments(conflicts);
      setFormDataForConflict(data);
      setIsConflictDialogOpen(true);
    } else {
      handleActualSave(data);
    }
  };

  if (isLoadingPage) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between"><Skeleton className="h-10 w-3/5" /><Skeleton className="h-9 w-24" /></div>
            <Card className="shadow-lg"><CardContent className="pt-6 space-y-6">
                {[...Array(4)].map((_,i) => <div key={i} className="space-y-2"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-10 w-full" /></div>)}
                <div className="flex justify-end"><Skeleton className="h-10 w-32" /></div>
            </CardContent></Card>
        </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarOff className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Editar Bloqueio: {currentBlockReason}</CardTitle>
            <CardDescription>Modifique os detalhes do bloqueio selecionado.</CardDescription>
          </CardHeader>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company/agenda-blocks">
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
                name="target_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alvo do Bloqueio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o alvo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="empresa">Empresa Inteira</SelectItem>
                        <SelectItem value="profissional">Profissional Específico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchTargetType === "profissional" && (
                <FormField
                  control={form.control}
                  name="professional_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissional</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum (Empresa Inteira)</SelectItem>
                          {professionals.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data/Hora de Início</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data/Hora de Fim</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo do Bloqueio</FormLabel>
                    <FormControl><Textarea {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="repeats_weekly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="repeat-weekly-edit"/>
                      </FormControl>
                      <FormLabel htmlFor="repeat-weekly-edit" className="font-normal mb-0!">Repetir Semanalmente</FormLabel>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Bloqueio Ativo</FormLabel>
                         <FormDescription>Se marcado, o bloqueio impedirá novos agendamentos.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving || isLoadingPage} size="lg">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Verificando/Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={isConflictDialogOpen} onOpenChange={setIsConflictDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><Ban className="mr-2 h-5 w-5 text-destructive" />Conflito de Agendamento Encontrado!</AlertDialogTitle>
            <AlertDialogDescription>
              Existem {conflictingAppointments.length} agendamento(s) confirmado(s) neste intervalo:
              <ul className="list-disc pl-5 mt-2 text-sm text-foreground">
                {conflictingAppointments.map(appt => (
                  <li key={appt.id}>{appt.clienteNome} - {appt.servico} em {appt.dataHora}</li>
                ))}
              </ul>
              <br/>
              Deseja prosseguir com o bloqueio? Isso irá cancelar os agendamentos listados acima e notificar os clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConflictingAppointments([]);
              setFormDataForConflict(null);
            }}>Não, Manter Agendamentos</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (formDataForConflict) {
                  handleActualSave(formDataForConflict);
                }
                setIsConflictDialogOpen(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, Bloquear e Cancelar Afetados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    