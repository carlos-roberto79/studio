"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/constants";
import { USER_ROLES } from "@/lib/constants";

interface UserRoleSelectorProps {
  onValueChange: (value: UserRole) => void;
  defaultValue?: UserRole;
}

export function UserRoleSelector({ onValueChange, defaultValue }: UserRoleSelectorProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione seu papel" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={USER_ROLES.CLIENT}>Cliente (Quero marcar horários)</SelectItem>
        <SelectItem value={USER_ROLES.PROFESSIONAL}>Profissional (Ofereço serviços)</SelectItem>
        <SelectItem value={USER_ROLES.COMPANY_ADMIN}>Empresa (Gerencio um negócio com múltiplos profissionais)</SelectItem>
      </SelectContent>
    </Select>
  );
}
