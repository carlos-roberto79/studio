"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";

// Mock available time slots for a selected day
const mockTimeSlots = {
  "2024-07-15": ["09:00", "10:00", "14:00", "15:00"],
  "2024-07-16": ["09:30", "11:00", "13:00"],
  // Add more dates and slots as needed
};

type MockTimeSlots = typeof mockTimeSlots;

export function AvailabilityCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0); // for disabling past dates correctly

  const selectedDateString = date ? date.toISOString().split('T')[0] : null;
  const availableSlotsForDay = selectedDateString ? (mockTimeSlots as MockTimeSlots)[selectedDateString as keyof MockTimeSlots] || [] : [];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Example: disable weekends (Saturday: 6, Sunday: 0) and past dates
  const disabledDays: (Date | DateRange | ((date: Date) => boolean))[] = [
    { before: today }, // Disable all past dates
    (day) => day.getDay() === 0 || day.getDay() === 6, // Disable Sundays and Saturdays
  ];

  return (
    <Card className="w-full max-w-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Selecione Data e Hora</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border p-0"
            disabled={disabledDays}
            locale={{
              localize: {
                month: n => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][n],
                day: n => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][n]
              },
              formatLong: {}
            } as any} // Using 'as any' to bypass strict type checking for simplified locale
          />
        </div>
        <div className="flex-grow space-y-4">
          <h3 className="font-semibold text-lg">
            Horários disponíveis para {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "data selecionada"}
          </h3>
          {availableSlotsForDay.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSlotsForDay.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum horário disponível para este dia. Por favor, selecione outra data.</p>
          )}
          {selectedTime && date && (
            <div className="mt-4 p-3 bg-secondary rounded-md">
              <p className="font-semibold">Você selecionou:</p>
              <p>{date.toLocaleDateString('pt-BR')} às <Badge>{selectedTime}</Badge></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
