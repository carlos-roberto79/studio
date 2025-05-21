
"use client";

import React from 'react';
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { PlusCircle, XCircle } from "lucide-react";
import type { AvailabilityTypeFormZodData } from '@/app/dashboard/company/availability-types/add/page'; // Ajuste o caminho se o tipo for movido

interface DayScheduleFormProps {
  dayKey: keyof AvailabilityTypeFormZodData['schedule'];
  dayLabel: string;
}

export function DayScheduleForm({ dayKey, dayLabel }: DayScheduleFormProps) {
  const { control, watch, formState: { errors } } = useFormContext<AvailabilityTypeFormZodData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedule.${dayKey}.intervals`
  });

  const dayIsActive = watch(`schedule.${dayKey}.active`);

  // Acessar erros específicos para os intervalos deste dia
  const dayErrors = errors.schedule?.[dayKey]?.intervals as any;
  const dayRootError = errors.schedule?.[dayKey]?.root as any;
  const scheduleRootError = errors.schedule?.root as any;


  return (
    <div className="p-4 border rounded-md space-y-3">
      <FormField
        control={control}
        name={`schedule.${dayKey}.active`}
        render={({ field: dayActiveField }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={dayActiveField.value}
                onCheckedChange={(checked) => {
                  dayActiveField.onChange(checked);
                }}
              />
            </FormControl>
            <FormLabel className="font-semibold text-md">{dayLabel}</FormLabel>
          </FormItem>
        )}
      />

      {dayIsActive && (
        <div className="space-y-2 pl-6">
          {fields.map((intervalField, index) => (
            <div key={intervalField.id} className="flex items-end gap-2">
              <FormField
                control={control}
                name={`schedule.${dayKey}.intervals.${index}.start`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Início</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`schedule.${dayKey}.intervals.${index}.end`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">Fim</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="text-destructive hover:text-destructive"
                title="Remover horário"
                disabled={fields.length <= 1}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ start: "", end: "" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Horário
          </Button>
        </div>
      )}
      {dayErrors?.root?.message && <FormMessage>{dayErrors.root.message}</FormMessage>}
      {dayRootError?.message && <FormMessage>{dayRootError.message}</FormMessage>}
      {dayKey === 'seg' && scheduleRootError?.message && <FormMessage>{scheduleRootError.message}</FormMessage>}
    </div>
  );
}

