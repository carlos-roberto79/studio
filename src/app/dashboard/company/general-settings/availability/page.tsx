
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Clock, Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, updateCompanyDetails, type CompanyData } from "@/services/supabaseService";
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

type CompanyOperatingHours = {
    [key: string]: DayAvailability;
};

const initialOperatingHours: CompanyOperatingHours = daysOfWeek.reduce((acc, day) => {
    acc[day.id] = { 
        active: day.id !== 'sab' && day.id !== 'dom', 
        startTime: '09:00', 
        endTime: '18:00', 
        breakStartTime: '12:00', 
        breakEndTime: '13:00' 
    };
    return acc;
}, {} as CompanyOperatingHours);


export default function CompanyOperatingHoursPage() {
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [operatingHours, setOperatingHours] = useState<CompanyOperatingHours>(initialOperatingHours);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    document.title = `Horário de Funcionamento - ${APP_NAME}`;
  }, []);

  useEffect(() => {
    if (!authLoading && user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      setIsLoadingPage(true);
      getCompanyDetailsByOwner(user.id)
        .then(companyData => {
          if (companyData && companyData.id) {
            setCompanyId(companyData.id);
            if (companyData.operating_hours) {
              // Validar e mesclar com initialOperatingHours para garantir que todos os dias estão presentes
              const loadedHours = companyData.operating_hours as CompanyOperatingHours;
              const completeHours: CompanyOperatingHours = { ...initialOperatingHours };
              for (const dayId of daysOfWeek.map(d => d.id)) {
                if (loadedHours[dayId]) {
                  completeHours[dayId] = {
                    active: loadedHours[dayId].active !== undefined ? loadedHours[dayId].active : initialOperatingHours[dayId].active,
                    startTime: loadedHours[dayId].startTime || initialOperatingHours[dayId].startTime,
                    endTime: loadedHours[dayId].endTime || initialOperatingHours[dayId].endTime,
                    breakStartTime: loadedHours[dayId].breakStartTime || initialOperatingHours[dayId].breakStartTime,
                    breakEndTime: loadedHours[dayId].breakEndTime || initialOperatingHours[dayId].breakEndTime,
                  };
                }
              }
              setOperatingHours(completeHours);
            } else {
              setOperatingHours(initialOperatingHours);
            }
          } else {
            toast({ title: "Erro", description: "Empresa não encontrada. Cadastre os detalhes da empresa primeiro.", variant: "destructive" });
            router.push("/dashboard/company/edit-profile");
          }
        })
        .catch(error => {
          console.error("Erro ao buscar horários da empresa:", error);
          toast({ title: "Erro ao Carregar", description: "Não foi possível carregar os horários de funcionamento.", variant: "destructive" });
        })
        .finally(() => {
          setIsLoadingPage(false);
        });
    } else if (!authLoading && (!user || role !== USER_ROLES.COMPANY_ADMIN)) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, role, authLoading, router, toast]);

  const handleHoursChange = (dayId: string, field: keyof DayAvailability, value: any) => {
    setOperatingHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSaveChanges = async () => {
    if (!companyId) {
      toast({ title: "Erro", description: "ID da empresa não encontrado para salvar os horários.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateCompanyDetails(companyId, { operating_hours: operatingHours });
      toast({ title: "Horário de Funcionamento Atualizado", description: "O horário de funcionamento da empresa foi salvo com sucesso." });
    } catch (error: any) {
      console.error("Erro ao salvar horário de funcionamento:", error);
      toast({ title: "Falha ao Salvar", description: error.message || "Não foi possível salvar o horário de funcionamento.", variant: "destructive" });
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
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Clock className="mr-3 h-8 w-8 text-primary" /> Horário de Funcionamento da Empresa
          </CardTitle>
          <CardDescription>Defina os horários globais em que sua empresa opera. Profissionais e serviços deverão operar dentro destes limites.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                    Estes são os limites máximos de horário para agendamentos na sua empresa.
                    Profissionais individuais podem ter seus próprios horários configurados, desde que respeitem estes limites.
                </p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Horário Semanal de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map(day => (
            <div key={day.id} className="grid grid-cols-1 md:grid-cols-[150px_1fr_auto] items-center gap-4 p-4 border rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`active-${day.id}`} 
                  checked={operatingHours[day.id]?.active}
                  onCheckedChange={(checked) => handleHoursChange(day.id, 'active', !!checked)}
                />
                <Label htmlFor={`active-${day.id}`} className="font-semibold text-md">{day.label}</Label>
              </div>
              {operatingHours[day.id]?.active ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <Label htmlFor={`start-${day.id}`} className="text-xs">Abre às</Label>
                    <Input 
                      type="time" 
                      id={`start-${day.id}`} 
                      value={operatingHours[day.id]?.startTime}
                      onChange={(e) => handleHoursChange(day.id, 'startTime', e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${day.id}`} className="text-xs">Fecha às</Label>
                    <Input 
                      type="time" 
                      id={`end-${day.id}`} 
                      value={operatingHours[day.id]?.endTime}
                      onChange={(e) => handleHoursChange(day.id, 'endTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                   <div>
                    <Label htmlFor={`break-start-${day.id}`} className="text-xs">Início Pausa (Opc.)</Label>
                    <Input 
                      type="time" 
                      id={`break-start-${day.id}`} 
                      value={operatingHours[day.id]?.breakStartTime || ""}
                      onChange={(e) => handleHoursChange(day.id, 'breakStartTime', e.target.value)}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor={`break-end-${day.id}`} className="text-xs">Fim Pausa (Opc.)</Label>
                    <Input 
                      type="time" 
                      id={`break-end-${day.id}`} 
                      value={operatingHours[day.id]?.breakEndTime || ""}
                      onChange={(e) => handleHoursChange(day.id, 'breakEndTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground md:col-span-2">Fechado neste dia.</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving || isLoadingPage} size="lg">
          <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Horário de Funcionamento"}
        </Button>
      </div>
    </div>
  );
}
    
