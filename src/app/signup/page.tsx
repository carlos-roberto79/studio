import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Cadastre-se no ${APP_NAME}`,
  description: `Crie uma conta no ${APP_NAME} para começar a agendar consultas sem esforço.`,
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
