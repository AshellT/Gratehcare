import { Role } from "@prisma/client";

/** Maps Supabase `profiles.role` values to Prisma `Role` enum values. */
export const supabaseRoleToPrisma: Record<string, Role> = {
  platform_owner: Role.PLATFORM_OWNER,
  super_admin: Role.SUPER_ADMIN,
  platform_support: Role.PLATFORM_SUPPORT,
  org_owner: Role.ORGANIZATION_OWNER,
  operations_admin: Role.OPERATIONS_ADMIN,
  care_coordinator: Role.CARE_COORDINATOR,
  support_worker: Role.SUPPORT_WORKER,
  billing_officer: Role.BILLING_OFFICER,
  compliance_officer: Role.COMPLIANCE_OFFICER,
  family: Role.FAMILY_USER,
  practitioner: Role.PRACTITIONER,
};

export const prismaRoleToSupabase: Record<Role, string> = {
  [Role.PLATFORM_OWNER]: "platform_owner",
  [Role.SUPER_ADMIN]: "super_admin",
  [Role.PLATFORM_SUPPORT]: "platform_support",
  [Role.ORGANIZATION_OWNER]: "org_owner",
  [Role.OPERATIONS_ADMIN]: "operations_admin",
  [Role.CARE_COORDINATOR]: "care_coordinator",
  [Role.SUPPORT_WORKER]: "support_worker",
  [Role.BILLING_OFFICER]: "billing_officer",
  [Role.COMPLIANCE_OFFICER]: "compliance_officer",
  [Role.FAMILY_USER]: "family",
  [Role.PRACTITIONER]: "practitioner",
};
