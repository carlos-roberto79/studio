
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES, APP_NAME } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";

const formSchemaBase = {
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
};

const loginSchema = z.object(formSchemaBase);

const signupSchema = z.object({
  ...formSchemaBase,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type AuthFormProps = {
  mode: "login" | "signup";
};

// Função para extrair mensagem de erro, compatível com erros do Supabase
function getSupabaseErrorMessage(error: any): string {
  return error.message || "Ocorreu um erro inesperado durante a autenticação.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : signupSchema;
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { confirmPassword: "" }),
    },
  });

  const { toast } = useToast();
  const router = useRouter();
  const { login, signup: authSignup, loading } = useAuth(); // Essas funções agora usam Supabase

  async function onSubmit(values: FormData) {
    try {
      if (isLogin) {
        const loggedInRole = await login(values.email, values.password); // Chama a função de login do AuthContext (Supabase)
        toast({ title: "Login Bem-sucedido", description: "Bem-vindo(a) de volta!" });
        if (loggedInRole === USER_ROLES.SITE_ADMIN) {
          router.push("/site-admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Para o cadastro público, o papel padrão será COMPANY_ADMIN.
        // A lógica de atribuir o papel correto (SITE_ADMIN, PROFESSIONAL_TEST_EMAIL) já está no signup do AuthContext.
        await authSignup(values.email, values.password, USER_ROLES.COMPANY_ADMIN); // Chama a função de signup do AuthContext (Supabase)
        toast({ title: "Conta de Administrador Criada", description: "Prossiga para cadastrar os detalhes da sua empresa. Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada." });
        router.push("/register-company");
      }
    } catch (error: any) {
      toast({
        title: "Erro de Autenticação",
        description: getSupabaseErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Bem-vindo(a) de Volta!" : `Crie uma Conta para sua Empresa no ${APP_NAME}`}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Faça login para gerenciar seus agendamentos ou acessar o painel restrito." : `Cadastre sua empresa para começar a usar o ${APP_NAME}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isLogin && (
                <>
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processando..." : (isLogin ? "Login" : "Criar Conta de Administrador")}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <>
                Não tem uma conta de empresa?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Cadastre sua empresa
                </Link>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Faça login
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
