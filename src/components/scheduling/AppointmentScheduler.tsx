"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, User, Briefcase } from "lucide-react";
import Image from "next/image";
import React from 'react'; // Added React import

// Mock data
const mockCompany = {
  name: "Salão Glamour",
  logo: "https://placehold.co/80x80.png?text=SG",
  description: "Seu destino único para beleza e bem-estar. Agende seu horário com nossos profissionais especialistas hoje mesmo!",
  services: [
    { id: "1", name: "Corte de Cabelo & Estilo", duration: "60 min", price: "R$50" },
    { id: "2", name: "Manicure", duration: "45 min", price: "R$30" },
    { id: "3", name: "Tratamento Facial", duration: "75 min", price: "R$80" },
    { id: "4", name: "Massoterapia", duration: "60 min", price: "R$70" },
  ],
  professionals: [
    { id: "prof1", name: "Joana Silva (Estilista)" },
    { id: "prof2", name: "João Santos (Massoterapeuta)" },
    { id: "prof3", name: "Alice Costa (Esteticista)" },
  ],
};

const appointmentSchema = z.object({
  service: z.string().min(1, { message: "Por favor, selecione um serviço." }),
  professional: z.string().optional(), // Assumindo que o profissional pode ser auto-atribuído ou opcional
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentScheduler({ companySlug }: { companySlug: string }) {
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      service: "",
      notes: "",
    },
  });

  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Em um app real, buscar dados da empresa com base no companySlug
  const company = mockCompany;

  async function onSubmit(values: AppointmentFormData) {
    setLoading(true);
    // Aqui, você também pegaria a data e hora selecionadas do estado do AvailabilityCalendar
    // Por enquanto, apenas registrando os valores do formulário
    console.log("Dados do Agendamento:", values);
    console.log("Slug da Empresa:", companySlug);

    try {
      // Simula chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Agendamento Confirmado!",
        description: `Seu horário para ${values.service} foi agendado com sucesso.`,
      });
      form.reset();
      // Potencialmente resetar o estado do calendário aqui também
    } catch (error: any) {
       toast({
        title: "Falha no Agendamento",
        description: error.message || "Não foi possível agendar o horário. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <Image 
            src={company.logo} 
            alt={`Logo de ${company.name}`} 
            width={80} 
            height={80} 
            className="mx-auto mb-4 rounded-md"
            data-ai-hint="logotipo empresa prédio"
          />
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <Briefcase className="mr-3 h-8 w-8 text-primary" /> Agende um Horário com {company.name}
          </CardTitle>
          <CardDescription className="text-lg mt-2">{company.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-semibold mb-4">1. Selecione Data e Hora</h3>
            <AvailabilityCalendar />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">2. Seus Detalhes e Serviço</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviço</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {company.services.map(service => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.duration} - {service.price})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="professional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profissional de Preferência (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer profissional disponível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Qualquer profissional disponível</SelectItem>
                          {company.professionals.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações Adicionais (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alguma solicitação ou informação específica..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                  {loading ? "Agendando..." : <> <CalendarCheck className="mr-2 h-5 w-5" /> Confirmar Agendamento</>}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
