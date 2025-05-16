
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type CompanyOperatingHours = {
    [key: string]: DayAvailability;
};

const initialOperatingHours: CompanyOperatingHours = daysOfWeek.reduce((acc, day) => {
    acc[day.id] = { active: day.id !== 'sab' && day.id !== 'dom', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' };
    return acc;
}, {} as CompanyOperatingHours);


export default function CompanyOperatingHoursPage() {
  const { toast } = useToast();
  const [operatingHours, setOperatingHours] = useState<CompanyOperatingHours>(initialOperatingHours);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = `Horário de Funcionamento - ${APP_NAME}`;
    // Em um app real, buscar horário de funcionamento existente aqui
    console.log("BACKEND_SIM: Buscando configurações de horário de funcionamento da empresa...");
  }, []);

  const handleHoursChange = (dayId: string, field: keyof DayAvailability, value: any) => {
    setOperatingHours(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Salvando horário de funcionamento da empresa:", { operatingHours });
    // SIMULAÇÃO DE CHAMADA DE API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: "Horário de Funcionamento Atualizado (Simulação)", description: "O horário de funcionamento da empresa foi salvo." });
    setIsSaving(false);
  };

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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Horário Semanal de Funcionamento</CardTitle>
          <CardDescription>Estes são os limites máximos de horário para agendamentos na sua empresa.</CardDescription>
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
        <Button onClick={handleSaveChanges} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Horário de Funcionamento"}
        </Button>
      </div>
    </div>
  );
}
    
