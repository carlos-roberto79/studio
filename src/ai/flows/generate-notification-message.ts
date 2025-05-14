// use server'
'use server';

/**
 * @fileOverview AI-powered notification message generator for appointment updates.
 *
 * - generateNotificationMessage - A function that generates personalized notification messages.
 * - NotificationMessageInput - The input type for the generateNotificationMessage function.
 * - NotificationMessageOutput - The return type for the generateNotificationMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationMessageInputSchema = z.object({
  notificationType: z
    .enum(['confirmation', 'reminder', 'update'])
    .describe('The type of notification: confirmation, reminder, or update.'),
  userName: z.string().describe('The name of the user receiving the notification.'),
  appointmentDetails: z.string().describe('Details of the appointment, such as date, time, and service.'),
  companyName: z.string().describe('The name of the company related to the appointment.'),
  channel: z.enum(['email', 'whatsapp']).describe('The communication channel (email or whatsapp).'),
});

export type NotificationMessageInput = z.infer<typeof NotificationMessageInputSchema>;

const NotificationMessageOutputSchema = z.object({
  message: z.string().describe('The personalized notification message.'),
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
  prompt: `You are an AI assistant specializing in generating personalized notification messages for appointments.

  Based on the notification type ({{{notificationType}}}), user name ({{{userName}}}), appointment details ({{{appointmentDetails}}}), company name ({{{companyName}}}), and communication channel ({{{channel}}}), create a concise and engaging notification message.

  Ensure the message is appropriate for the channel (email or WhatsApp) and is tailored to the user and the context of the appointment.
  The message should be friendly and professional.

  Generate ONLY the message. Do not include a subject or title.

  Here are some examples:

  Confirmation:
  "Hi [User Name], your appointment with [Company Name] on [Date] at [Time] for [Service] has been confirmed."

  Reminder:
  "[User Name], friendly reminder of your upcoming appointment with [Company Name] on [Date] at [Time]."

  Update:
  "[User Name], there's an update regarding your appointment with [Company Name]. [Details of the update]."
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
