import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Login to ${APP_NAME}`,
  description: `Log in to your ${APP_NAME} account to manage your appointments.`,
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
