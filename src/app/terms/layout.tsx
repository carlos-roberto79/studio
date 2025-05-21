import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Termos de Serviço - ${APP_NAME}`,
  description: `Leia os termos de serviço para utilização da plataforma ${APP_NAME}.`,
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
