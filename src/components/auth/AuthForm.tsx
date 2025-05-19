
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

function getSupabaseErrorMessage(error: any): string {
  if (error && error.message) {
    if (error.message.includes("Invalid login credentials")) {
      return "E-mail ou senha inválidos.";
    }
    if (error.message.includes("User already registered")) {
      return "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.";
    }
    if (error.message.includes("Email rate limit exceeded")) {
      return "Muitas tentativas de cadastro. Por favor, aguarde um momento e tente novamente mais tarde.";
    }
    if (error.message.includes("Unable to validate email address")) {
        return "O endereço de e-mail fornecido não é válido.";
    }
    if (error.message.includes("Password should be at least 6 characters")) {
        return "A senha deve ter pelo menos 6 caracteres.";
    }
    // Adicione mais traduções ou tratamentos específicos aqui conforme necessário
    return error.message;
  }
  return "Ocorreu um erro inesperado durante a autenticação.";
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
  const { login: authLogin, signup: authSignupHook, loading } = useAuth();

  async function onSubmit(values: FormData) {
    try {
      if (isLogin) {
        const loggedInRole = await authLogin(values.email, values.password);
        toast({ title: "Login Bem-sucedido", description: "Bem-vindo(a) de volta!" });
        if (loggedInRole === USER_ROLES.SITE_ADMIN) {
          router.push("/site-admin");
        } else {
          router.push("/dashboard");
        }
      } else { // Signup
        // Para o cadastro público, o papel padrão será COMPANY_ADMIN.
        const signupResult = await authSignupHook(values.email, values.password, USER_ROLES.COMPANY_ADMIN);
        
        if (signupResult.user && signupResult.role) {
          if (signupResult.role === USER_ROLES.COMPANY_ADMIN) {
            toast({ title: "Conta de Administrador Criada!", description: "Prossiga para cadastrar os detalhes da sua empresa." });
            router.push("/register-company");
          } else { // SITE_ADMIN ou PROFESSIONAL (casos de teste)
            toast({ title: `Conta de ${signupResult.role} Criada!`, description: "Bem-vindo(a)!" });
            router.push(signupResult.role === USER_ROLES.SITE_ADMIN ? "/site-admin" : "/dashboard");
          }
        } else if (!signupResult.user && !signupResult.role && !signupResult.error) { 
          // Usuário criado no Supabase Auth, mas precisa de confirmação de e-mail.
          // O AuthContext.signup agora retorna { user: null, role: null, error: null } neste caso.
          toast({ title: "Verifique seu E-mail", description: "Um link de confirmação foi enviado para o seu e-mail. Por favor, confirme para ativar sua conta e poder fazer login." });
        } else if (signupResult.error) {
            // Se o AuthContext passou um erro específico (ex: "User already registered but needs confirmation")
            toast({
                title: "Ação Necessária",
                description: getSupabaseErrorMessage(signupResult.error),
                variant: "default", 
            });
        }
      }
    } catch (error: any) {
      console.error("Erro de Autenticação (AuthForm):", error);
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
