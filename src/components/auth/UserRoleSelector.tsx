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
        <SelectValue placeholder="Select your role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={USER_ROLES.CLIENT}>Client (I want to book appointments)</SelectItem>
        <SelectItem value={USER_ROLES.PROFESSIONAL}>Professional (I offer services)</SelectItem>
        <SelectItem value={USER_ROLES.COMPANY_ADMIN}>Company (I manage a business with multiple professionals)</SelectItem>
      </SelectContent>
    </Select>
  );
}
