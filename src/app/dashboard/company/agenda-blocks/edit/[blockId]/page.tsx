
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
import { ArrowLeft, Save, CalendarOff, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
import { useParams, useRouter } from "next/navigation";
import type { AgendaBlock, MockConflictingAppointment } from '@/lib/types';
import { agendaBlockSchema } from '@/lib/types'; // Assumindo que o schema está em types.ts


const MOCK_PROFESSIONALS = [
  { id: "prof1", name: "Dr. João Silva" },
  { id: "prof2", name: "Dra. Maria Oliveira" },
  { id: "prof3", name: "Carlos Esteticista" },
];

const MOCK_EXISTING_BLOCKS: Record<string, AgendaBlock> = {
    "block1": { id: "block1", targetType: "empresa", inicio: "2024-08-10T09:00", fim: "2024-08-10T17:00", motivo: "Feriado Municipal", repetirSemanalmente: false, ativo: true },
    "block2": { id: "block2", targetType: "profissional", profissionalId: "prof1", profissionalNome: "Dr. João Silva", inicio: "2024-08-12T12:00", fim: "2024-08-12T13:00", motivo: "Almoço João", repetirSemanalmente: true, ativo: true },
};

// Mock de agendamentos para simular conflitos
const MOCK_EXISTING_APPOINTMENTS_EDIT: MockConflictingAppointment[] = [
  { id: "apptEdit1", clienteNome: "Laura P.", dataHora: "27/07/2024 15:00", servico: "Manicure" },
  { id: "apptEdit2", clienteNome: "Pedro S.", dataHora: "27/07/2024 16:00", servico: "Corte Masculino" },
];


export default function EditAgendaBlockPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const blockId = params.blockId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBlockMotivo, setCurrentBlockMotivo] = useState<string>("Carregando...");

  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<MockConflictingAppointment[]>([]);
  const [formDataForConflict, setFormDataForConflict] = useState<AgendaBlock | null>(null);
  
  const form = useForm<AgendaBlock>({
    resolver: zodResolver(agendaBlockSchema),
  });
  
  const watchTargetType = form.watch("targetType");

  useEffect(() => {
    setIsLoading(true);
    const blockToEdit = MOCK_EXISTING_BLOCKS[blockId];
    if (blockToEdit) {
      form.reset(blockToEdit);
      setCurrentBlockMotivo(blockToEdit.motivo);
      document.title = `Editar Bloqueio: ${blockToEdit.motivo} - ${APP_NAME}`;
    } else {
      toast({ title: "Erro", description: "Bloqueio não encontrado.", variant: "destructive" });
      router.push("/dashboard/company/agenda-blocks");
    }
    setIsLoading(false);
  }, [blockId, form, router, toast]);

  const simulateConflictCheck = (blockData: AgendaBlock): MockConflictingAppointment[] => {
    // Simulação básica: se o motivo for alterado para algo específico ou data for específica
    if (blockData.motivo.toLowerCase().includes("urgente") || blockData.inicio.includes("2024-07-27")) {
      return MOCK_EXISTING_APPOINTMENTS_EDIT;
    }
    return [];
  };

  const handleActualSave = async (data: AgendaBlock) => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Atualizando bloqueio de agenda:", { blockId, data });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({ title: "Bloqueio Atualizado (Simulação)", description: `O bloqueio "${data.motivo}" foi atualizado.` });

    if (conflictingAppointments.length > 0 && formDataForConflict) {
        toast({
            title: "Agendamentos Cancelados (Simulação)",
            description: `${conflictingAppointments.length} agendamento(s) conflitante(s) foram cancelados e os clientes notificados.`,
            variant: "destructive"
        });
    }
    setConflictingAppointments([]);
    setFormDataForConflict(null);
    setIsSaving(false);
    router.push('/dashboard/company/agenda-blocks');
  };

  const onSubmit = async (data: AgendaBlock) => {
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados do bloqueio...</p></div>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarOff className="mr-3 h-8 w-8 text-primary" />
          <CardHeader className="p-0">
            <CardTitle className="text-3xl font-bold">Editar Bloqueio: {currentBlockMotivo}</CardTitle>
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
                name="targetType"
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
                  name="profissionalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissional</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {MOCK_PROFESSIONALS.map(prof => (
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
                  name="inicio"
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
                  name="fim"
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
                name="motivo"
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
                  name="repetirSemanalmente"
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
                  name="ativo"
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
                <Button type="submit" disabled={isSaving} size="lg">
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
