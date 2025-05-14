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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

const companySchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  cnpj: z.string().refine((value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), {
    message: "Invalid CNPJ format. Use XX.XXX.XXX/XXXX-XX.",
  }),
  address: z.string().min(5, { message: "Address is too short." }),
  phone: z.string().min(10, { message: "Phone number seems too short." }),
  email: z.string().email({ message: "Invalid email address for the company." }),
  publicLinkSlug: z.string().min(3, { message: "Link slug must be at least 3 characters." })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens." }),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyRegistrationForm() {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      address: "",
      phone: "",
      email: "",
      publicLinkSlug: "",
    },
  });

  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(values: CompanyFormData) {
    setLoading(true);
    console.log("Company Registration Data:", values);
    // Here you would typically send data to your backend/Firebase
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Registration Submitted!",
        description: `Company ${values.companyName} registration is processing. Your public link will be /agendar/${values.publicLinkSlug}`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
            <Building className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Register Your Company</CardTitle>
        </div>
        <CardDescription>
          Provide your company details to get started with EasyAgenda and create your public scheduling page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="publicLinkSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Scheduling Link Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                        /agendar/
                      </span>
                      <Input placeholder="your-company-name" {...field} className="rounded-l-none"/>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This will be part of your public link (e.g., easyagenda.com/agendar/{field.value || "your-company-name"}).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register Company"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
