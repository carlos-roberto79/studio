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
import React from "react";

const companySchema = z.object({
  companyName: z.string().min(2, { message: "O nome da empresa deve ter pelo menos 2 caracteres." }),
  cnpj: z.string().refine((value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), {
    message: "Formato de CNPJ inválido. Use XX.XXX.XXX/XXXX-XX.",
  }),
  address: z.string().min(5, { message: "Endereço muito curto." }),
  phone: z.string().min(10, { message: "Número de telefone parece muito curto." }),
  email: z.string().email({ message: "Endereço de e-mail inválido para a empresa." }),
  publicLinkSlug: z.string().min(3, { message: "O slug do link deve ter pelo menos 3 caracteres." })
    .regex(/^[a-z0-9-]+$/, { message: "O slug pode conter apenas letras minúsculas, números e hífens." }),
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
    console.log("Dados de Cadastro da Empresa:", values);
    // Aqui você normalmente enviaria os dados para seu backend/Firebase
    try {
      // Simula chamada de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Cadastro Enviado!",
        description: `O cadastro da empresa ${values.companyName} está em processamento. Seu link público será /agendar/${values.publicLinkSlug}`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Falha no Cadastro",
        description: error.message || "Não foi possível cadastrar a empresa. Por favor, tente novamente.",
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
            <CardTitle className="text-2xl">Cadastre Sua Empresa</CardTitle>
        </div>
        <CardDescription>
          Forneça os detalhes da sua empresa para começar com o TDS+Agenda e criar sua página pública de agendamento.
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
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua Empresa LTDA" {...field} />
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
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Rua Principal, 123, Cidade, Estado" {...field} />
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
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
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
                    <FormLabel>E-mail da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@suaempresa.com" {...field} />
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
                  <FormLabel>Slug do Link Público de Agendamento</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                        /agendar/
                      </span>
                      <Input placeholder="sua-empresa" {...field} className="rounded-l-none"/>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Isso fará parte do seu link público (ex: tds.agenda/agendar/{field.value || "sua-empresa"}).
                    Use letras minúsculas, números e hífens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Empresa"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

