import { CompanyRegistrationForm } from "@/components/company/CompanyRegistrationForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Cadastre Sua Empresa - ${APP_NAME}`,
  description: `Junte-se ao ${APP_NAME} cadastrando sua empresa. Crie sua página pública de agendamento e gerencie agendamentos eficientemente.`,
};

export default function RegisterCompanyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
      <CompanyRegistrationForm />
    </div>
  );
}

