
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

type GeneralAvailability = {
    [key: string]: DayAvailability;
};

const initialAvailability: GeneralAvailability = daysOfWeek.reduce((acc, day) => {
    acc[day.id] = { active: day.id !== 'sab' && day.id !== 'dom', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' };
    return acc;
}, {} as GeneralAvailability);

type ApplyToOption = "all_services" | "all_professionals";

export default function CompanyGeneralAvailabilityPage() {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<GeneralAvailability>(initialAvailability);
  const [applyTo, setApplyTo] = useState<ApplyToOption>("all_services");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Disponibilidade Padrão da Empresa - ${APP_NAME}`;
    // Em um app real, buscar disponibilidade geral existente aqui
    console.log("BACKEND_SIM: Buscando configurações gerais de disponibilidade...");
  }, []);

  const handleAvailabilityChange = (dayId: string, field: keyof DayAvailability, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Salvando configurações gerais de disponibilidade:", { availability, applyTo });
    // SIMULAÇÃO DE CHAMADA DE API
    // Em um app real, aqui você faria uma chamada para seu backend:
    // try {
    //   await api.saveGeneralAvailability({ availability, applyTo });
    //   toast({ title: "Sucesso!", description: "Disponibilidade padrão salva no servidor." });
    // } catch (error) {
    //   toast({ title: "Erro no Servidor", description: "Não foi possível salvar a disponibilidade padrão.", variant: "destructive" });
    // }
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: "Disponibilidade Padrão Atualizada (Simulação)", description: "As configurações de disponibilidade padrão da empresa foram salvas." });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Clock className="mr-3 h-8 w-8 text-primary" /> Disponibilidade Padrão da Empresa
          </CardTitle>
          <CardDescription>Defina os horários de funcionamento padrão que podem ser herdados por serviços e profissionais.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel da Empresa
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Horário Semanal Padrão</CardTitle>
          <CardDescription>Estes horários serão sugeridos ao criar novos serviços ou adicionar profissionais.</CardDescription>
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
            <CardTitle className="text-xl">Aplicar Padrão Para</CardTitle>
            <CardDescription>Selecione onde estas configurações de disponibilidade devem ser aplicadas como padrão. Elas poderão ser sobrescritas individualmente.</CardDescription>
        </CardHeader>
        <CardContent>
            <RadioGroup defaultValue={applyTo} onValueChange={(value: ApplyToOption) => setApplyTo(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all_services" id="apply_services" />
                <Label htmlFor="apply_services">Todos os Serviços</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all_professionals" id="apply_professionals" />
                <Label htmlFor="apply_professionals">Todos os Profissionais</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-4">
                Nota: A lógica de herança e aplicação real destas configurações padrão ocorreria no backend. Esta interface define a intenção.
            </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAvailability} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Configurações Gerais"}
        </Button>
      </div>
    </div>
  );
}

    