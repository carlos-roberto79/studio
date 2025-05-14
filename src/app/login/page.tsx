import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Login no ${APP_NAME}`,
  description: `Faça login na sua conta ${APP_NAME} para gerenciar seus agendamentos.`,
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
