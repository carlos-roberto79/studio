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
  notificationType: z.enum(['confirmation', 'reminder', 'update'], { required_error: "Notification type is required." }),
  userName: z.string().min(2, { message: "User name must be at least 2 characters." }),
  appointmentDetails: z.string().min(10, { message: "Appointment details must be at least 10 characters." }),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  channel: z.enum(['email', 'whatsapp'], { required_error: "Channel is required." }),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export function NotificationGeneratorForm() {
  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      notificationType: 'confirmation',
      userName: "John Doe",
      appointmentDetails: "Dental Check-up on July 20th at 10:00 AM",
      companyName: "Bright Smiles Dental",
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
        title: "Notification Generated!",
        description: "AI has crafted a personalized message.",
      });
    } catch (error: any) {
      console.error("Error generating notification:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate notification. Please try again.",
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
          <CardTitle className="text-2xl">AI Notification Generator</CardTitle>
        </div>
        <CardDescription>
          Test the AI's ability to craft personalized appointment notifications.
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
                    <FormLabel>Notification Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="confirmation">Confirmation</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
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
                    <FormLabel>Channel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
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
                  <FormLabel>User Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Acme Corp" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appointmentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Meeting on Oct 26th at 3 PM about Project X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating..." : <><Wand2 className="mr-2 h-4 w-4" /> Generate Message</>}
            </Button>
          </form>
        </Form>

        {generatedMessage && (
          <Card className="mt-8 bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" /> Generated Message</CardTitle>
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
