
import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Cadastre sua Empresa no ${APP_NAME}`,
  description: `Cadastre sua empresa no ${APP_NAME} para gerenciar agendamentos e oferecer seus serviços.`,
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}

