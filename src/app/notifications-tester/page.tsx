import { NotificationGeneratorForm } from "@/components/notifications/NotificationGeneratorForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `AI Notification Tester - ${APP_NAME}`,
  description: `Test and generate smart notifications using AI for ${APP_NAME}.`,
};

export default function NotificationsTesterPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
      <NotificationGeneratorForm />
    </div>
  );
}
