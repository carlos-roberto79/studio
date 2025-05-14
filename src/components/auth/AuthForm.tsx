
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
// import { UserRoleSelector } from "./UserRoleSelector"; // Removido pois não será mais usado aqui
import { USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/lib/constants";


const formSchemaBase = {
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
};

const loginSchema = z.object(formSchemaBase);

const signupSchema = z.object({
  ...formSchemaBase,
  confirmPassword: z.string(),
  // O campo 'role' foi removido pois será fixo para COMPANY_ADMIN no cadastro público
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type AuthFormProps = {
  mode: "login" | "signup";
};

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
  const { login, signup: authSignup, loading } = useAuth();

  async function onSubmit(values: FormData) {
    try {
      if (isLogin) {
        await login(values.email, values.password);
        toast({ title: "Login Bem-sucedido", description: "Bem-vindo(a) de volta!" });
        router.push("/dashboard");
      } else {
        // Para signup, 'values' será do tipo z.infer<typeof signupSchema>
        // que inclui email, password, confirmPassword.
        // O papel é fixado como COMPANY_ADMIN.
        await authSignup(values.email, values.password, USER_ROLES.COMPANY_ADMIN);
        toast({ title: "Conta de Administrador Criada", description: "Prossiga para cadastrar os detalhes da sua empresa." });
        router.push("/register-company"); // Redireciona para o formulário de detalhes da empresa
      }
    } catch (error: any) {
      toast({
        title: "Erro de Autenticação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Bem-vindo(a) de Volta!" : "Crie uma Conta para sua Empresa"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Faça login para gerenciar seus agendamentos." : "Cadastre sua empresa para começar a usar o EasyAgenda."}
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
                    <FormLabel>E-mail do Administrador</FormLabel>
                    <FormControl>
                      <Input placeholder="voce@suaempresa.com" {...field} />
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
                  {/* O seletor de papel foi removido. O cadastro é sempre COMPANY_ADMIN. */}
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
