import { AppointmentScheduler } from "@/components/scheduling/AppointmentScheduler";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

type Props = {
  params: { companySlug: string };
};

// This function can be used if you need to generate metadata dynamically
// For now, we'll use a generic title, or you could fetch company name
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const companySlug = params.companySlug;
  // In a real app, fetch company name using slug
  const companyName = companySlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()); // Basic slug to title
  
  return {
    title: `Agende com ${companyName} - ${APP_NAME}`,
    description: `Marque seu horário com ${companyName} através do ${APP_NAME}. Agendamento online fácil e conveniente.`,
  };
}

export default function CompanySchedulePage({ params }: Props) {
  return (
    <div className="bg-secondary min-h-screen py-8">
      <AppointmentScheduler companySlug={params.companySlug} />
    </div>
  );
}

