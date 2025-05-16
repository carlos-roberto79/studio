
export const USER_ROLES = {
  CLIENT: 'client',
  PROFESSIONAL: 'professional',
  COMPANY_ADMIN: 'company_admin',
  SITE_ADMIN: 'site_admin', // Novo papel
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const APP_NAME = "EasyAgenda";
