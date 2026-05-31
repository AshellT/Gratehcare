export type Role =
  | "platform_owner"
  | "super_admin"
  | "platform_support"
  | "org_owner"
  | "operations_admin"
  | "care_coordinator"
  | "support_worker"
  | "billing_officer"
  | "compliance_officer"
  | "family"
  | "practitioner";

export const ROLE_LABELS: Record<Role, string> = {
  platform_owner: "Platform Owner",
  super_admin: "Super Admin",
  platform_support: "Platform Support",
  org_owner: "Organization Owner",
  operations_admin: "Operations Admin",
  care_coordinator: "Care Coordinator",
  support_worker: "Support Worker",
  billing_officer: "Billing Officer",
  compliance_officer: "Compliance Officer",
  family: "Family User",
  practitioner: "Practitioner",
};

export const ROLE_GROUPS: { label: string; roles: Role[] }[] = [
  {
    label: "Platform",
    roles: ["platform_owner", "super_admin", "platform_support"],
  },
  {
    label: "Organization",
    roles: [
      "org_owner",
      "operations_admin",
      "care_coordinator",
      "support_worker",
      "billing_officer",
      "compliance_officer",
    ],
  },
  {
    label: "External",
    roles: ["family", "practitioner"],
  },
];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  platform_owner: "Full control of the GRATEHCARE platform, tenants and billing.",
  super_admin: "System-wide configuration and tenant management.",
  platform_support: "Tenant support, impersonation and incident triage.",
  org_owner: "Strategic view of the entire organisation.",
  operations_admin: "Run day-to-day operations across teams and locations.",
  care_coordinator: "Build rosters and orchestrate care delivery.",
  support_worker: "Mobile-first shifts, care notes and timesheets.",
  billing_officer: "Invoices, claims and payment reconciliation.",
  compliance_officer: "Credentials, audits and incident workflows.",
  family: "Stay informed about your loved one's care.",
  practitioner: "Collaborate on care plans and clinical outcomes.",
};

export const ROLE_ACCENTS: Record<Role, string> = {
  platform_owner: "from-violet-500 to-fuchsia-500",
  super_admin: "from-slate-700 to-slate-900",
  platform_support: "from-amber-500 to-orange-500",
  org_owner: "from-indigo-600 to-sky-500",
  operations_admin: "from-sky-500 to-cyan-500",
  care_coordinator: "from-indigo-500 to-blue-500",
  support_worker: "from-rose-500 to-pink-500",
  billing_officer: "from-emerald-500 to-teal-500",
  compliance_officer: "from-amber-600 to-yellow-500",
  family: "from-fuchsia-500 to-pink-500",
  practitioner: "from-teal-500 to-emerald-500",
};

/** Map UI role slug to Prisma Role enum value for API calls. */
export const roleToPrisma = (role: Role): string => {
  const map: Record<Role, string> = {
    platform_owner: "PLATFORM_OWNER",
    super_admin: "SUPER_ADMIN",
    platform_support: "PLATFORM_SUPPORT",
    org_owner: "ORGANIZATION_OWNER",
    operations_admin: "OPERATIONS_ADMIN",
    care_coordinator: "CARE_COORDINATOR",
    support_worker: "SUPPORT_WORKER",
    billing_officer: "BILLING_OFFICER",
    compliance_officer: "COMPLIANCE_OFFICER",
    family: "FAMILY_USER",
    practitioner: "PRACTITIONER",
  };
  return map[role];
};

export const prismaRoleToUi = (prismaRole: string): Role | null => {
  const map: Record<string, Role> = {
    PLATFORM_OWNER: "platform_owner",
    SUPER_ADMIN: "super_admin",
    PLATFORM_SUPPORT: "platform_support",
    ORGANIZATION_OWNER: "org_owner",
    OPERATIONS_ADMIN: "operations_admin",
    CARE_COORDINATOR: "care_coordinator",
    SUPPORT_WORKER: "support_worker",
    BILLING_OFFICER: "billing_officer",
    COMPLIANCE_OFFICER: "compliance_officer",
    FAMILY_USER: "family",
    PRACTITIONER: "practitioner",
  };
  return map[prismaRole] ?? null;
};
