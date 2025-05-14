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
import type { ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRoleSelector } from "./UserRoleSelector";
import type { UserRole } from "@/lib/constants";
import { USER_ROLES } from "@/lib/constants";

const formSchemaBase = {
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
};

const loginSchema = z.object(formSchemaBase);

const signupSchema = z.object({
  ...formSchemaBase,
  confirmPassword: z.string(),
  role: z.enum([USER_ROLES.CLIENT, USER_ROLES.PROFESSIONAL, USER_ROLES.COMPANY_ADMIN], {
    required_error: "You need to select a role.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
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
      ...(isLogin ? {} : { confirmPassword: "", role: USER_ROLES.CLIENT }),
    },
  });

  const { toast } = useToast();
  const router = useRouter();
  const { login, signup: authSignup, loading } = useAuth();

  async function onSubmit(values: FormData) {
    try {
      if (isLogin) {
        await login(values.email, values.password);
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push("/dashboard");
      } else {
        // Ensure values has role for signup
        const signupValues = values as z.infer<typeof signupSchema>;
        await authSignup(signupValues.email, signupValues.password, signupValues.role);
        toast({ title: "Signup Successful", description: "Welcome to EasyAgenda! Please log in." });
        router.push("/login"); // Redirect to login after signup
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Welcome Back!" : "Create an Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Log in to manage your appointments." : "Sign up to start scheduling with EasyAgenda."}
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
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
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel>I am a...</FormLabel>
                        <UserRoleSelector 
                          onValueChange={field.onChange} 
                          defaultValue={field.value as UserRole} // Cast as UserRole
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
