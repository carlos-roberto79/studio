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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateNotificationMessage, type NotificationMessageInput } from "@/ai/flows/generate-notification-message";
import { Wand2, MessageSquare } from "lucide-react";
import { useState } from "react";

const notificationSchema = z.object({
  notificationType: z.enum(['confirmation', 'reminder', 'update'], { required_error: "O tipo de notificação é obrigatório." }),
  userName: z.string().min(2, { message: "O nome do usuário deve ter pelo menos 2 caracteres." }),
  appointmentDetails: z.string().min(10, { message: "Os detalhes do agendamento devem ter pelo menos 10 caracteres." }),
  companyName: z.string().min(2, { message: "O nome da empresa deve ter pelo menos 2 caracteres." }),
  channel: z.enum(['email', 'whatsapp'], { required_error: "O canal é obrigatório." }),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationGeneratorForm() {
  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      notificationType: 'confirmation',
      userName: "João Silva",
      appointmentDetails: "Consulta Odontológica em 20 de Julho às 10:00",
      companyName: "Sorriso Dental",
      channel: 'email',
    },
  });

  const { toast } = useToast();
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: NotificationFormData) {
    setLoading(true);
    setGeneratedMessage(null);
    try {
      const input: NotificationMessageInput = values;
      const result = await generateNotificationMessage(input);
      setGeneratedMessage(result.message);
      toast({
        title: "Notificação Gerada!",
        description: "A IA criou uma mensagem personalizada.",
      });
    } catch (error: any) {
      console.error("Erro ao gerar notificação:", error);
      toast({
        title: "Falha na Geração",
        description: error.message || "Não foi possível gerar a notificação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Wand2 className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Gerador de Notificações IA</CardTitle>
        </div>
        <CardDescription>
          Teste a capacidade da IA de criar notificações de agendamento personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="notificationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Notificação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="confirmation">Confirmação</SelectItem>
                        <SelectItem value="reminder">Lembrete</SelectItem>
                        <SelectItem value="update">Atualização</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecione o canal" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Usuário</FormLabel>
                  <FormControl><Input placeholder="ex: Maria Silva" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl><Input placeholder="ex: Consultório XYZ" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalhes do Agendamento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ex: Reunião em 26 de Outubro às 15h sobre o Projeto X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Gerando..." : <><Wand2 className="mr-2 h-4 w-4" /> Gerar Mensagem</>}
            </Button>
          </form>
        </Form>

        {generatedMessage && (
          <Card className="mt-8 bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" /> Mensagem Gerada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{generatedMessage}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
