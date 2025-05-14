import { NotificationGeneratorForm } from "@/components/notifications/NotificationGeneratorForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Testador de Notificações IA - ${APP_NAME}`,
  description: `Teste e gere notificações inteligentes usando IA para ${APP_NAME}.`,
};

export default function NotificationsTesterPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
      <NotificationGeneratorForm />
    </div>
  );
}
