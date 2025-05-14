import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sign Up for ${APP_NAME}`,
  description: `Create an account with ${APP_NAME} to start scheduling appointments effortlessly.`,
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
