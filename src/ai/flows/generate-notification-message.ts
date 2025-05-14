// use server'
'use server';

/**
 * @fileOverview Gerador de mensagens de notificação alimentado por IA para atualizações de agendamentos.
 *
 * - generateNotificationMessage - Uma função que gera mensagens de notificação personalizadas.
 * - NotificationMessageInput - O tipo de entrada para a função generateNotificationMessage.
 * - NotificationMessageOutput - O tipo de retorno para a função generateNotificationMessage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationMessageInputSchema = z.object({
  notificationType: z
    .enum(['confirmation', 'reminder', 'update'])
    .describe('O tipo de notificação: confirmação, lembrete ou atualização.'),
  userName: z.string().describe('O nome do usuário que recebe a notificação.'),
  appointmentDetails: z.string().describe('Detalhes do agendamento, como data, hora e serviço.'),
  companyName: z.string().describe('O nome da empresa relacionada ao agendamento.'),
  channel: z.enum(['email', 'whatsapp']).describe('O canal de comunicação (email ou whatsapp).'),
});

export type NotificationMessageInput = z.infer<typeof NotificationMessageInputSchema>;

const NotificationMessageOutputSchema = z.object({
  message: z.string().describe('A mensagem de notificação personalizada.'),
});

export type NotificationMessageOutput = z.infer<typeof NotificationMessageOutputSchema>;

export async function generateNotificationMessage(
  input: NotificationMessageInput
): Promise<NotificationMessageOutput> {
  return generateNotificationMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'notificationMessagePrompt',
  input: {schema: NotificationMessageInputSchema},
  output: {schema: NotificationMessageOutputSchema},
  prompt: `Você é um assistente de IA especializado em gerar mensagens de notificação personalizadas para agendamentos.

  Com base no tipo de notificação ({{{notificationType}}}), nome do usuário ({{{userName}}}), detalhes do agendamento ({{{appointmentDetails}}}), nome da empresa ({{{companyName}}}) e canal de comunicação ({{{channel}}}), crie uma mensagem de notificação concisa e envolvente.

  Certifique-se de que a mensagem seja apropriada para o canal (e-mail ou WhatsApp) e seja adaptada ao usuário e ao contexto do agendamento.
  A mensagem deve ser amigável e profissional.

  Gere APENAS a mensagem. Não inclua assunto ou título.

  Aqui estão alguns exemplos:

  Confirmação:
  "Olá [Nome do Usuário], seu agendamento com [Nome da Empresa] em [Data] às [Hora] para [Serviço] foi confirmado."

  Lembrete:
  "[Nome do Usuário], lembrete amigável do seu próximo agendamento com [Nome da Empresa] em [Data] às [Hora]."

  Atualização:
  "[Nome do Usuário], há uma atualização sobre seu agendamento com [Nome da Empresa]. [Detalhes da atualização]."
  `,
});

const generateNotificationMessageFlow = ai.defineFlow(
  {
    name: 'generateNotificationMessageFlow',
    inputSchema: NotificationMessageInputSchema,
    outputSchema: NotificationMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
