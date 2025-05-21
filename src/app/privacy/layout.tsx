import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Política de Privacidade - ${APP_NAME}`,
  description: `Entenda como o ${APP_NAME} coleta, usa e protege suas informações pessoais.`,
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
