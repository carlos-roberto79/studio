"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

// Mock data
const mockCompany = {
  name: "Glamour Salon",
  logo: "https://placehold.co/80x80.png?text=GS",
  description: "Your one-stop destination for beauty and wellness. Book your appointment with our expert professionals today!",
  services: [
    { id: "1", name: "Haircut & Style", duration: "60 min", price: "$50" },
    { id: "2", name: "Manicure", duration: "45 min", price: "$30" },
    { id: "3", name: "Facial Treatment", duration: "75 min", price: "$80" },
    { id: "4", name: "Massage Therapy", duration: "60 min", price: "$70" },
  ],
  professionals: [
    { id: "prof1", name: "Jane Doe (Stylist)" },
    { id: "prof2", name: "John Smith (Masseuse)" },
    { id: "prof3", name: "Alice Brown (Esthetician)" },
  ],
};

const appointmentSchema = z.object({
  service: z.string().min(1, { message: "Please select a service." }),
  professional: z.string().optional(), // Assuming professional might be auto-assigned or optional
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

  // In a real app, fetch company data based on companySlug
  const company = mockCompany;

  async function onSubmit(values: AppointmentFormData) {
    setLoading(true);
    // Here, you would also get the selected date and time from AvailabilityCalendar state
    // For now, just logging the form values
    console.log("Appointment Data:", values);
    console.log("Company Slug:", companySlug);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Appointment Booked!",
        description: `Your appointment for ${values.service} has been successfully scheduled.`,
      });
      form.reset();
      // Potentially reset calendar state here too
    } catch (error: any) {
       toast({
        title: "Booking Failed",
        description: error.message || "Could not book appointment. Please try again.",
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
            alt={`${company.name} logo`} 
            width={80} 
            height={80} 
            className="mx-auto mb-4 rounded-md"
            data-ai-hint="company logo building"
          />
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <Briefcase className="mr-3 h-8 w-8 text-primary" /> Book an Appointment with {company.name}
          </CardTitle>
          <CardDescription className="text-lg mt-2">{company.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-xl font-semibold mb-4">1. Select Date & Time</h3>
            <AvailabilityCalendar />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">2. Your Details & Service</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
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
                      <FormLabel>Preferred Professional (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any available professional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Any available professional</SelectItem>
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
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific requests or information..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                  {loading ? "Booking..." : <> <CalendarCheck className="mr-2 h-5 w-5" /> Confirm Appointment</>}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Added React to imports
import React from 'react';
