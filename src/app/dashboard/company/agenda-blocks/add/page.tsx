
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
import { useRouter } from 'next/navigation';
import type { AgendaBlockData as AgendaBlockFormDataFromService, MockConflictingAppointment } from '@/lib/types'; // Renomeado para evitar conflito
import { agendaBlockSchema } from '@/lib/types'; 
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, addAgendaBlock, getProfessionalsForSelect } from "@/services/supabaseService";

// Simulação de agendamentos conflitantes
const MOCK_EXISTING_APPOINTMENTS: MockConflictingAppointment[] = [
  { id: "appt1", clienteNome: "Ana P.", dataHora: "25/07/2024 10:00", servico: "Consulta Inicial" },
  { id: "appt2", clienteNome: "Bruno L.", dataHora: "25/07/2024 11:00", servico: "Acompanhamento" },
];


export default function AddAgendaBlockPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<MockConflictingAppointment[]>([]);
  const [formDataForConflict, setFormDataForConflict] = useState<AgendaBlockFormDataFromService | null>(null);


  const form = useForm<AgendaBlockFormDataFromService>({ // Usando o tipo importado
    resolver: zodResolver(agendaBlockSchema),
    defaultValues: {
      target_type: "empresa",
      professional_id: "",
      start_time: "",
      end_time: "",
      reason: "",
      repeats_weekly: false,
      active: true,
    },
  });

  const watchTargetType = form.watch("target_type");

  useEffect(() => {
    document.title = `Criar Bloqueio de Agenda - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
          fetchProfessionals(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
        }
        setIsLoadingPage(false);
      });
    } else {
      setIsLoadingPage(false);
    }
  }, [user, role, toast]);

  const fetchProfessionals = async (currentCompanyId: string) => {
    try {
      const profs = await getProfessionalsForSelect(currentCompanyId);
      setProfessionals(profs);
    } catch (error: any) {
      toast({ title: "Erro ao buscar profissionais", description: error.message, variant: "destructive" });
    }
  };


  const simulateConflictCheck = (blockData: AgendaBlockFormDataFromService): MockConflictingAppointment[] => {
    try {
        const blockStartDate = new Date(blockData.start_time);
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (blockStartDate.getFullYear() === tomorrow.getFullYear() &&
            blockStartDate.getMonth() === tomorrow.getMonth() &&
            blockStartDate.getDate() === tomorrow.getDate()) {
            return MOCK_EXISTING_APPOINTMENTS.slice(0, 2); 
        }
    } catch (e) {
      console.error("Erro ao processar datas para checagem de conflito:", e);
    }
    return []; 
  };

  const handleActualSave = async (data: AgendaBlockFormDataFromService) => {
    if (!companyId) {
      toast({ title: "Erro", description: "ID da empresa não encontrado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await addAgendaBlock(companyId, data);
      toast({ title: "Bloqueio Criado", description: `O bloqueio para "${data.reason}" foi criado.` });
      
      if (conflictingAppointments.length > 0 && formDataForConflict) {
          toast({
              title: "Agendamentos Cancelados (Simulação)",
              description: `${conflictingAppointments.length} agendamento(s) conflitante(s) foram cancelados e os clientes notificados.`,
              variant: "destructive"
          });
      }
      form.reset();
      setConflictingAppointments([]);
      setFormDataForConflict(null);
      router.push('/dashboard/company/agenda-blocks');
    } catch (error: any) {
      toast({ title: "Erro ao Criar Bloqueio", description: error.message, variant: "destructive" });
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
    return <div className="text-center p-10">Carregando...</div>;
  }
  if (!companyId && !isLoadingPage) {
     return <div className="text-center p-10 text-destructive">Não foi possível carregar os dados da empresa. Verifique se o perfil da empresa está completo.</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarOff className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Criar Novo Bloqueio de Agenda</CardTitle>
            <CardDescription>Defina períodos em que não haverá agendamentos.</CardDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormControl><Textarea placeholder="Ex: Reunião de equipe, Férias, Manutenção" {...field} rows={3} /></FormControl>
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
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} id="repeat-weekly"/>
                      </FormControl>
                      <FormLabel htmlFor="repeat-weekly" className="font-normal mb-0!">Repetir Semanalmente</FormLabel>
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
                        <FormDescription>
                          Se marcado, o bloqueio impedirá novos agendamentos.
                        </FormDescription>
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
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? "Verificando/Salvando..." : "Salvar Bloqueio"}
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

    