import { Role } from "@prisma/client";
import { PermissionAction } from "../decorators/permissions.decorator";

export type PermissionResource =
  | "platform"
  | "dashboard"
  | "system"
  | "support"
  | "operations"
  | "staff"
  | "clients"
  | "rostering"
  | "timesheets"
  | "care"
  | "medication"
  | "messages"
  | "finance"
  | "compliance"
  | "settings"
  | "reports";

const full: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "archive",
  "approve",
  "finalize",
  "manage",
  "export",
];
const manage: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "archive",
  "approve",
  "finalize",
  "manage",
  "export",
];
const operate: PermissionAction[] = ["view", "create", "edit", "archive", "approve", "export"];
const contribute: PermissionAction[] = ["view", "create", "edit"];
const readOnly: PermissionAction[] = ["view", "export"];
const assigned: PermissionAction[] = ["view", "create", "edit", "export"];

export const ROLE_RESOURCE_PERMISSIONS: Record<Role, Partial<Record<PermissionResource | "*", PermissionAction[]>>> = {
  PLATFORM_OWNER: { "*": full },
  SUPER_ADMIN: {
    dashboard: ["view", "create", "export", "manage"],
    platform: manage,
    system: manage,
    support: manage,
    operations: manage,
    staff: manage,
    clients: manage,
    rostering: manage,
    timesheets: manage,
    care: manage,
    medication: manage,
    messages: manage,
    finance: readOnly,
    compliance: manage,
    reports: manage,
    settings: ["view", "edit"],
  },
  PLATFORM_SUPPORT: {
    dashboard: ["view", "create", "export", "manage"],
    support: manage,
    platform: readOnly,
    operations: readOnly,
    staff: readOnly,
    clients: readOnly,
    care: readOnly,
    messages: assigned,
    compliance: assigned,
    reports: readOnly,
    settings: ["view", "edit"],
  },
  ORGANIZATION_OWNER: {
    dashboard: ["view"],
    platform: readOnly,
    operations: manage,
    staff: manage,
    clients: manage,
    rostering: manage,
    timesheets: manage,
    care: manage,
    medication: manage,
    messages: manage,
    finance: ["view", "create", "edit", "approve", "finalize", "export"],
    compliance: manage,
    reports: manage,
    system: ["view", "create", "edit"],
    settings: ["view", "edit", "manage"],
  },
  OPERATIONS_ADMIN: {
    dashboard: ["view", "create", "edit", "export"],
    operations: operate,
    staff: operate,
    clients: operate,
    rostering: operate,
    timesheets: ["view", "edit", "approve", "finalize", "export"],
    care: operate,
    medication: ["view", "create", "edit", "export"],
    messages: operate,
    compliance: ["view", "create", "edit", "export"],
    reports: readOnly,
    settings: ["view", "edit"],
  },
  CARE_COORDINATOR: {
    dashboard: ["view", "create", "edit", "export"],
    operations: assigned,
    staff: ["view"],
    clients: assigned,
    rostering: assigned,
    care: assigned,
    medication: ["view", "create", "edit"],
    messages: assigned,
    reports: ["view", "export"],
    settings: ["view", "edit"],
  },
  SUPPORT_WORKER: {
    dashboard: ["view", "create", "edit", "export"],
    rostering: ["view"],
    timesheets: contribute,
    care: contribute,
    clients: ["view"],
    staff: ["view"],
    medication: ["view", "create"],
    messages: contribute,
    settings: ["view", "edit"],
  },
  BILLING_OFFICER: {
    dashboard: ["view", "create", "edit"],
    finance: manage,
    clients: readOnly,
    reports: ["view", "export"],
    messages: ["view", "create"],
    settings: ["view", "edit"],
  },
  COMPLIANCE_OFFICER: {
    dashboard: ["view", "create", "export"],
    compliance: manage,
    staff: ["view", "edit", "export"],
    clients: readOnly,
    care: readOnly,
    reports: ["view", "export"],
    messages: ["view", "create", "edit"],
    settings: ["view", "edit"],
  },
  FAMILY_USER: {
    dashboard: ["view"],
    clients: ["view"],
    care: ["view"],
    rostering: ["view"],
    finance: ["view"],
    messages: ["view", "create"],
    settings: ["view", "edit"],
  },
  PRACTITIONER: {
    dashboard: ["view"],
    clients: ["view"],
    care: assigned,
    medication: ["view"],
    reports: ["view", "create", "edit", "export"],
    messages: assigned,
    settings: ["view", "edit"],
  },
};

export const RESOURCE_BY_PREFIX: Record<string, PermissionResource> = {
  clients: "clients",
  staff: "staff",
  rostering: "rostering",
  timesheets: "timesheets",
  "care-plans": "care",
  "care-notes": "care",
  documents: "care",
  medication: "medication",
  incidents: "compliance",
  credentials: "compliance",
  billing: "finance",
  finance: "finance",
  claims: "finance",
  compliance: "compliance",
  messages: "messages",
  reports: "reports",
  "audit-logs": "reports",
  tickets: "support",
  knowledge: "support",
  users: "system",
  roles: "system",
  system: "system",
  organizations: "platform",
  integrations: "platform",
  "ai-insights": "dashboard",
  notifications: "dashboard",
};

export function permissionsForRole(role: Role, resource: PermissionResource): PermissionAction[] {
  const config = ROLE_RESOURCE_PERMISSIONS[role] || {};
  return config[resource] || config["*"] || [];
}

export function roleHasPermission(
  roles: Role[],
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  return roles.some((role) => {
    const permissions = permissionsForRole(role, resource);
    return permissions.includes(action) || permissions.includes("manage");
  });
}

export function resourceFromRequestPath(pathname: string): PermissionResource | null {
  const clean = pathname.split("?")[0].replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("v1");
  const prefix = apiIndex >= 0 ? parts[apiIndex + 1] : parts[0];
  if (!prefix) return null;
  return RESOURCE_BY_PREFIX[prefix] ?? null;
}

export function selfUserIdFromPath(pathname: string): string | null {
  const clean = pathname.split("?")[0].replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  const apiIndex = parts.indexOf("v1");
  const prefix = apiIndex >= 0 ? parts[apiIndex + 1] : parts[0];
  const id = apiIndex >= 0 ? parts[apiIndex + 2] : parts[1];
  if (prefix !== "users" || !id || id === "archive") return null;
  return id;
}
