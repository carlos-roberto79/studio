
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Assuming this can be reused or adapted
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";


const daysOfWeek = [
    { id: 'seg', label: 'Segunda-feira' },
    { id: 'ter', label: 'Terça-feira' },
    { id: 'qua', label: 'Quarta-feira' },
    { id: 'qui', label: 'Quinta-feira' },
    { id: 'sex', label: 'Sexta-feira' },
    { id: 'sab', label: 'Sábado' },
    { id: 'dom', label: 'Domingo' },
];

type Availability = {
    [key: string]: { active: boolean; startTime: string; endTime: string; breakStartTime?: string; breakEndTime?: string };
};

const initialAvailability: Availability = daysOfWeek.reduce((acc, day) => {
    acc[day.id] = { active: day.id !== 'sab' && day.id !== 'dom', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00' };
    return acc;
}, {} as Availability);


export default function ProfessionalAvailabilityPage() {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<Availability>(initialAvailability);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDateOverrides, setSelectedDateOverrides] = useState<Date | undefined>();
  const [dateOverrideAvailability, setDateOverrideAvailability] = useState<{active: boolean, slots: string[]}>({active: true, slots: []});

  useEffect(() => {
    document.title = `Definir Disponibilidade - ${APP_NAME}`;
    // In a real app, fetch existing availability here
  }, []);

  const handleAvailabilityChange = (dayId: string, field: keyof Availability[string], value: any) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSaveAvailability = async () => {
    setIsSaving(true);
    // Simulate API call
    console.log("Saving weekly availability:", availability);
    console.log("Saving date overrides:", {date: selectedDateOverrides, override: dateOverrideAvailability});
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({ title: "Disponibilidade Atualizada", description: "Seus horários foram salvos com sucesso." });
    setIsSaving(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Clock className="mr-3 h-8 w-8 text-primary" /> Definir Disponibilidade
          </CardTitle>
          <CardDescription>Configure seus horários de trabalho semanais e exceções.</CardDescription>
        </CardHeader>
        <Button variant="outline" asChild>
          <Link href="/dashboard/professional">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
          </Link>
        </Button>
      </div>

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
                  onCheckedChange={(checked) => handleAvailabilityChange(day.id, 'active', checked)}
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
            <CardTitle className="text-xl">Exceções e Horários Especiais</CardTitle>
            <CardDescription>Adicione ou remova horários para datas específicas (ex: feriados, eventos).</CardDescription>
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
                    <Button size="sm" onClick={() => alert('Exceção para ' + selectedDateOverrides.toLocaleDateString('pt-BR') + ' adicionada/atualizada. Clique em Salvar Todas Alterações.')}>Aplicar Exceção para esta Data</Button>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveAvailability} disabled={isSaving} size="lg">
          <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Todas Alterações"}
        </Button>
      </div>
    </div>
  );
}
