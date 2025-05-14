import { CompanyRegistrationForm } from "@/components/company/CompanyRegistrationForm";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Register Your Company - ${APP_NAME}`,
  description: `Join ${APP_NAME} by registering your company. Create your public scheduling page and manage appointments efficiently.`,
};

export default function RegisterCompanyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 flex flex-col items-center">
      <CompanyRegistrationForm />
    </div>
  );
}
