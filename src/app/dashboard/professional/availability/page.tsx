
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; 
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Clock, Save, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { getProfessionalByUserId, updateProfessional, type ProfessionalData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


const daysOfWeek = [
    { id: 'seg', label: 'Segunda-feira' },
    { id: 'ter', label: 'Terça-feira' },
    { id: 'qua', label: 'Quarta-feira' },
    { id: 'qui', label: 'Quinta-feira' },
    { id: 'sex', label: 'Sexta-feira' },
    { id: 'sab', label: 'Sábado' },
    { id: 'dom', label: 'Domingo' },
];

type DayAvailability = {
    active: boolean;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
};

type ProfessionalAvailability = {
    [key: string]: DayAvailability;
};

const initialAvailability: ProfessionalAvailability = daysOfWeek.reduce((acc, day) => {
    acc[day.id] = { 
        active: day.id !== 'sab' && day.id !== 'dom', 
        startTime: '09:00', 
        endTime: '18:00', 
        breakStartTime: '12:00', 
        breakEndTime: '13:00' 
    };
    return acc;
}, {} as ProfessionalAvailability);


export default function ProfessionalAvailabilityPage() {
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<ProfessionalAvailability>(initialAvailability);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
  // Mock para exceções, não conectado ao Supabase nesta fase
  const [selectedDateOverrides, setSelectedDateOverrides] = useState<Date | undefined>();
  const [dateOverrideAvailability, setDateOverrideAvailability] = useState<{active: boolean, slots: string[]}>({active: true, slots: []});

  useEffect(() => {
    document.title = `Definir Disponibilidade - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.PROFESSIONAL) {
      setIsLoadingPage(true);
      getProfessionalByUserId(user.id)
        .then(profData => {
          if (profData && profData.id) {
            setProfessionalId(profData.id);
            if (profData.availability) {
              // Mesclar com initialAvailability para garantir que todos os dias estão presentes
              const loadedAvailability = profData.availability as ProfessionalAvailability;
              const completeAvailability: ProfessionalAvailability = { ...initialAvailability };
              for (const dayId of daysOfWeek.map(d => d.id)) {
                if (loadedAvailability[dayId]) {
                  completeAvailability[dayId] = {
                    active: loadedAvailability[dayId].active !== undefined ? loadedAvailability[dayId].active : initialAvailability[dayId].active,
                    startTime: loadedAvailability[dayId].startTime || initialAvailability[dayId].startTime,
                    endTime: loadedAvailability[dayId].endTime || initialAvailability[dayId].endTime,
                    breakStartTime: loadedAvailability[dayId].breakStartTime || initialAvailability[dayId].breakStartTime,
                    breakEndTime: loadedAvailability[dayId].breakEndTime || initialAvailability[dayId].breakEndTime,
                  };
                }
              }
              setAvailability(completeAvailability);
            } else {
              setAvailability(initialAvailability);
            }
          } else {
            toast({ title: "Erro", description: "Perfil profissional não encontrado. Contate o administrador.", variant: "destructive" });
            // router.push("/dashboard/professional"); // Ou outra ação
          }
        })
        .catch(error => {
          console.error("Erro ao buscar dados do profissional:", error);
          toast({ title: "Erro ao Carregar", description: "Não foi possível carregar seus dados de disponibilidade.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!authLoading && (!user || role !== USER_ROLES.PROFESSIONAL)) {
      router.push(user ? '/dashboard' : '/login');
    } else if (!authLoading && !user) {
      setIsLoadingPage(false);
    }
  }, [user, role, authLoading, router, toast]);

  const handleAvailabilityChange = (dayId: string, field: keyof DayAvailability, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSaveAvailability = async () => {
    if (!professionalId) {
      toast({ title: "Erro", description: "ID do profissional não encontrado. Não é possível salvar.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateProfessional(professionalId, { availability: availability });
      // Lógica para salvar exceções (dateOverrideAvailability) seria aqui também
      console.log("BACKEND_SIM: Salvando exceções de datas (mock):", {date: selectedDateOverrides, override: dateOverrideAvailability});
      toast({ title: "Disponibilidade Atualizada", description: "Seus horários foram salvos com sucesso." });
    } catch (error: any) {
      console.error("Erro ao salvar disponibilidade:", error);
      toast({ title: "Falha ao Salvar", description: error.message || "Não foi possível salvar seus horários.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoadingPage) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-3/5" />
                <Skeleton className="h-9 w-32" />
            </div>
            <Card className="shadow-lg"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="pt-6 space-y-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                <div className="flex justify-end"><Skeleton className="h-10 w-28" /></div>
            </CardContent></Card>
             <Card className="shadow-lg"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Clock className="mr-3 h-8 w-8 text-primary" /> Definir Minha Disponibilidade
          </CardTitle>
          <CardDescription>Configure seus horários de trabalho semanais e exceções. Lembre-se que seus horários devem estar dentro do horário de funcionamento da empresa.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/professional">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-sm border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                    Seu horário de trabalho deve estar dentro do horário de funcionamento definido pela empresa.
                    Horários cadastrados fora do expediente da empresa podem não ser considerados válidos para agendamentos.
                    Verifique o horário de funcionamento da empresa com o administrador.
                </p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Horário Semanal Padrão</CardTitle>
          <CardDescription>Defina seus horários regulares de atendimento para cada dia da semana.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map(day => (
            <div key={day.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr_auto] items-center gap-4 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`active-${day.id}`} 
                  checked={availability[day.id]?.active}
                  onCheckedChange={(checked) => handleAvailabilityChange(day.id, 'active', !!checked)}
                />
                <Label htmlFor={`active-${day.id}`} className="font-semibold text-md">{day.label}</Label>
              </div>
              {availability[day.id]?.active ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label htmlFor={`start-${day.id}`} className="text-xs">Início</Label>
                    <Input 
                      type="time" 
                      id={`start-${day.id}`} 
                      value={availability[day.id]?.startTime}
                      onChange={(e) => handleAvailabilityChange(day.id, 'startTime', e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${day.id}`} className="text-xs">Fim</Label>
                    <Input 
                      type="time" 
                      id={`end-${day.id}`} 
                      value={availability[day.id]?.endTime}
                      onChange={(e) => handleAvailabilityChange(day.id, 'endTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                   <div>
                    <Label htmlFor={`break-start-${day.id}`} className="text-xs">Início Pausa (Opc.)</Label>
                    <Input 
                      type="time" 
                      id={`break-start-${day.id}`} 
                      value={availability[day.id]?.breakStartTime || ""}
                      onChange={(e) => handleAvailabilityChange(day.id, 'breakStartTime', e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`break-end-${day.id}`} className="text-xs">Fim Pausa (Opc.)</Label>
                    <Input 
                      type="time" 
                      id={`break-end-${day.id}`} 
                      value={availability[day.id]?.breakEndTime || ""}
                      onChange={(e) => handleAvailabilityChange(day.id, 'breakEndTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground md:col-span-2">Não disponível neste dia.</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl">Exceções e Horários Especiais (Mock)</CardTitle>
            <CardDescription>Adicione ou remova horários para datas específicas (ex: feriados, eventos). Esta seção é um placeholder e não salva dados no backend.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
                <Label>Selecione uma data para configurar exceção:</Label>
                 <Calendar
                    mode="single"
                    selected={selectedDateOverrides}
                    onSelect={setSelectedDateOverrides}
                    className="rounded-md border mt-1"
                    disabled={{ before: new Date() }}
                 />
            </div>
            {selectedDateOverrides && (
                <div className="space-y-4">
                    <h4 className="font-semibold">Configurar para {selectedDateOverrides.toLocaleDateString('pt-BR')}:</h4>
                     <div className="flex items-center space-x-2">
                        <Checkbox 
                        id="override-active" 
                        checked={dateOverrideAvailability.active}
                        onCheckedChange={(checked) => setDateOverrideAvailability(prev => ({...prev, active: !!checked}))}
                        />
                        <Label htmlFor="override-active">Disponível neste dia</Label>
                    </div>
                    {dateOverrideAvailability.active && (
                        <div>
                            <Label htmlFor="override-slots">Horários específicos (separados por vírgula, ex: 09:00,10:30,14:15)</Label>
                            <Input 
                                id="override-slots" 
                                placeholder="09:00,10:30,14:15"
                                value={dateOverrideAvailability.slots.join(',')}
                                onChange={e => setDateOverrideAvailability(prev => ({...prev, slots: e.target.value.split(',').map(s => s.trim())}))}
                                className="mt-1"
                            />
                        </div>
                    )}
                    <Button size="sm" onClick={() => toast({title:"Simulação", description: 'Exceção para ' + selectedDateOverrides.toLocaleDateString('pt-BR') + ' adicionada/atualizada. Clique em Salvar Todas Alterações.'})}>Aplicar Exceção para esta Data</Button>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAvailability} disabled={isSaving || isLoadingPage || authLoading} size="lg">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? "Salvando..." : "Salvar Todas Alterações"}
        </Button>
      </div>
    </div>
  );
}
