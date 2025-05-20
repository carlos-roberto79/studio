
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
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; 
import { addCompanyDetails, type CompanyData } from "@/services/supabaseService"; 
import { APP_NAME } from "@/lib/constants";

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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);


  async function onSubmit(values: CompanyFormData) {
    if (authLoading) {
        toast({ title: "Aguarde", description: "Finalizando autenticação...", variant: "default" });
        return;
    }
    if (!user || !user.id) {
      toast({
        title: "Erro de Autenticação",
        description: "Usuário não autenticado. Por favor, faça login novamente.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    
    const companyDataForSupabase: Omit<CompanyData, 'id' | 'created_at' | 'updated_at'> = {
      company_name: values.companyName,
      cnpj: values.cnpj,
      address: values.address,
      phone: values.phone,
      email: values.email,
      public_link_slug: values.publicLinkSlug,
      owner_uid: user.id,
      profile_complete: true, 
    };
    
    try {
      const companyId = await addCompanyDetails(companyDataForSupabase);

      if (companyId) {
        toast({
          title: "Perfil da Empresa Cadastrado!",
          description: `A empresa ${values.companyName} foi configurada com sucesso. Você será redirecionado(a).`,
        });
        // localStorage.setItem('tdsagenda_companyProfileComplete_mock', 'true'); 
        // localStorage.setItem('tdsagenda_companyName_mock', values.companyName);
        // localStorage.setItem('tdsagenda_companyEmail_mock', values.email);
        router.push('/dashboard/company'); 
      } else {
        // Este else pode não ser alcançado se addCompanyDetails sempre lançar erro em caso de falha
        const defaultError = "Não foi possível salvar os detalhes da empresa. ID da empresa não retornado.";
        setSubmissionError(defaultError);
        toast({ title: "Falha no Cadastro", description: defaultError, variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Falha ao cadastrar empresa (CompanyRegistrationForm catch):", error);
      const message = error.message || "Ocorreu um erro desconhecido ao salvar os detalhes da empresa.";
      setSubmissionError(message);
      toast({
        title: "Falha no Cadastro",
        description: `Erro: ${message}`, // Exibe a mensagem de erro específica
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
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
          Forneça os detalhes da sua empresa para começar com o {APP_NAME} e criar sua página pública de agendamento.
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
                    Isso fará parte do seu link público (ex: {APP_NAME.toLowerCase()}.com/agendar/{field.value || "sua-empresa"}).
                    Use letras minúsculas, números e hífens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submissionError && <p className="text-sm font-medium text-destructive">{submissionError}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
              {isSubmitting ? "Cadastrando..." : (authLoading ? "Aguardando autenticação..." : "Finalizar Cadastro da Empresa")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
