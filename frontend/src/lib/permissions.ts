import type { Role } from "@/lib/roles";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "archive"
  | "approve"
  | "finalize"
  | "manage"
  | "export"
  | "read-only"
  | "own-only"
  | "assigned-only"
  | "shared-only";

export type Resource =
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
  | "family_portal"
  | "practitioner_portal"
  | "settings"
  | "reports";

type RolePermissionConfig = {
  resources: Partial<Record<Resource | "*", PermissionAction[]>>;
};

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

const manage: PermissionAction[] = ["view", "create", "edit", "archive", "approve", "finalize", "manage", "export"];
const operate: PermissionAction[] = ["view", "create", "edit", "archive", "approve", "export"];
const contribute: PermissionAction[] = ["view", "create", "edit", "own-only"];
const readOnly: PermissionAction[] = ["view", "export", "read-only"];
const assigned: PermissionAction[] = ["view", "create", "edit", "export", "assigned-only"];
const sharedOnly: PermissionAction[] = ["view", "export", "read-only", "shared-only"];

export const ROLE_PERMISSIONS: Record<Role, RolePermissionConfig> = {
  platform_owner: {
    resources: { "*": full },
  },
  super_admin: {
    resources: {
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
  },
  platform_support: {
    resources: {
      dashboard: ["view", "create", "export", "manage"],
      support: manage,
      platform: readOnly,
      operations: readOnly,
      staff: readOnly,
      clients: readOnly,
      care: readOnly,
      messages: ["view", "create", "edit", "assigned-only"],
      compliance: ["view", "create", "edit", "export", "assigned-only"],
      reports: readOnly,
      settings: ["view", "edit"],
    },
  },
  org_owner: {
    resources: {
      dashboard: ["view"],
      operations: manage,
      staff: manage,
      clients: manage,
      rostering: manage,
      timesheets: manage,
      care: manage,
      medication: manage,
      messages: manage,
      finance: ["view", "approve", "finalize", "export", "read-only"],
      compliance: manage,
      reports: manage,
      settings: ["view", "edit", "manage"],
    },
  },
  operations_admin: {
    resources: {
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
  },
  care_coordinator: {
    resources: {
      dashboard: ["view", "create", "edit", "export"],
      operations: ["view", "create", "edit", "export", "assigned-only"],
      staff: ["view", "assigned-only"],
      clients: assigned,
      rostering: assigned,
      care: assigned,
      medication: ["view", "create", "edit", "assigned-only"],
      messages: assigned,
      reports: ["view", "export", "assigned-only"],
      settings: ["view", "edit"],
    },
  },
  support_worker: {
    resources: {
      dashboard: ["view", "create", "edit", "export"],
      rostering: ["view", "assigned-only"],
      timesheets: contribute,
      care: contribute,
      medication: ["view", "create", "own-only"],
      messages: contribute,
      settings: ["view", "edit"],
    },
  },
  billing_officer: {
    resources: {
      dashboard: ["view", "create", "edit"],
      finance: manage,
      clients: readOnly,
      reports: ["view", "export"],
      messages: ["view", "create"],
      settings: ["view", "edit"],
    },
  },
  compliance_officer: {
    resources: {
      dashboard: ["view", "create", "export"],
      compliance: manage,
      staff: ["view", "edit", "export"],
      clients: readOnly,
      care: readOnly,
      reports: ["view", "export"],
      messages: ["view", "create", "edit"],
      settings: ["view", "edit"],
    },
  },
  family: {
    resources: {
      dashboard: ["view", "create", "edit", "export"],
      family_portal: sharedOnly,
      messages: ["view", "create", "shared-only"],
      settings: ["view", "edit"],
    },
  },
  practitioner: {
    resources: {
      dashboard: ["view"],
      practitioner_portal: assigned,
      clients: ["view", "assigned-only"],
      care: assigned,
      medication: ["view", "assigned-only"],
      reports: ["view", "create", "edit", "export", "assigned-only"],
      messages: assigned,
      settings: ["view", "edit"],
    },
  },
};

export const RESOURCE_BY_PATH: Array<{ match: RegExp; resource: Resource }> = [
  { match: /^\/app\/?$/, resource: "dashboard" },
  { match: /^\/app\/(tenants|network|revenue|plans)/, resource: "platform" },
  { match: /^\/app\/(users|permissions|system)/, resource: "system" },
  { match: /^\/app\/(tickets|knowledge)/, resource: "support" },
  { match: /^\/app\/(staff|team)/, resource: "staff" },
  { match: /^\/app\/(clients|practitioner-clients)/, resource: "clients" },
  { match: /^\/app\/(schedule|rostering|open-shifts|shift-conflicts)/, resource: "rostering" },
  { match: /^\/app\/(timesheets|attendance)/, resource: "timesheets" },
  { match: /^\/app\/(care|care-plans|care-notes|outcomes|practitioner-care-plans|practitioner-clinical-notes|practitioner-evaluations)/, resource: "care" },
  { match: /^\/app\/(medication)/, resource: "medication" },
  { match: /^\/app\/(messages|practitioner-messages|family-messages)/, resource: "messages" },
  { match: /^\/app\/(billing|claims|financial-overview|billing-dashboard|invoices|invoice-builder|finance-claims|claim-tracking|payments|reconciliation|client-funding|revenue-reports|outstanding-balances|payouts|family-billing)/, resource: "finance" },
  { match: /^\/app\/(compliance|compliance-events|risk-alerts|staff-credentials|training-records|expiry-tracking|incidents|incident-register|investigations|audits|audit-logs|policy-tracking|corrective-actions|policies|training|alerts)/, resource: "compliance" },
  { match: /^\/app\/(family-overview|family-visit-history|family-care-notes|family-upcoming-visits|family-documents|family-invoices|family-payments|documents)/, resource: "family_portal" },
  { match: /^\/app\/(practitioner-overview|practitioner-reports)/, resource: "practitioner_portal" },
  { match: /^\/app\/(reports|activity|live-activity)/, resource: "reports" },
  { match: /^\/app\/(settings|profile)/, resource: "settings" },
];

export const resourceForPath = (path: string): Resource => {
  return RESOURCE_BY_PATH.find((entry) => entry.match.test(path))?.resource || "operations";
};

export const permissionsForRole = (role: Role, resource: Resource): PermissionAction[] => {
  const roleConfig = ROLE_PERMISSIONS[role];
  return roleConfig.resources[resource] || roleConfig.resources["*"] || [];
};

export const hasPermission = (
  role: Role | undefined,
  resource: Resource,
  action: PermissionAction = "view",
) => {
  if (!role) return false;
  const permissions = permissionsForRole(role, resource);
  return permissions.includes(action) || permissions.includes("manage");
};

export const canAccessPath = (role: Role | undefined, path: string) => {
  return hasPermission(role, resourceForPath(path), "view");
};

export const isReadOnly = (role: Role | undefined, resource: Resource) => {
  if (!role) return true;
  const permissions = permissionsForRole(role, resource);
  return permissions.includes("read-only") && !permissions.includes("manage");
};

export const actionFromLabel = (label: string): PermissionAction => {
  const value = label.toLowerCase();
  if (value.includes("export") || value.includes("download")) return "export";
  if (value.includes("new") || value.includes("add") || value.includes("create") || value.includes("invite") || value.includes("report")) return "create";
  if (value.includes("edit") || value.includes("save") || value.includes("upload") || value.includes("update")) return "edit";
  if (value.includes("delete") || value.includes("remove")) return "delete";
  if (value.includes("archive")) return "archive";
  if (value.includes("approve")) return "approve";
  if (value.includes("finalize") || value.includes("send") || value.includes("post") || value.includes("resolve") || value.includes("advance")) return "finalize";
  if (value.includes("manage")) return "manage";
  return "view";
};

export const canUseActionForPath = (
  role: Role | undefined,
  path: string,
  label: string,
) => hasPermission(role, resourceForPath(path), actionFromLabel(label));
