/**
 * Maps UI action labels (PageHeader, QuickActions, alert CTAs) to in-app routes.
 * Labels are normalized to lowercase trimmed strings before lookup.
 */

const ROUTES: Record<string, string> = {
  // Platform
  plans: "/app/plans",
  "plans & pricing": "/app/plans",
  "add tenant": "/app/tenants?action=create",
  "invite tenant": "/app/tenants?action=create",
  "new tenant": "/app/tenants?action=create",
  "all tenants": "/app/tenants",
  tenants: "/app/tenants",
  "open revenue": "/app/revenue",
  revenue: "/app/revenue",
  "network map": "/app/network",
  network: "/app/network",
  integrations: "/app/integrations",
  "open audit log": "/app/audit-logs",
  "audit log": "/app/audit-logs",
  "audit logs": "/app/audit-logs",
  system: "/app/system",
  permissions: "/app/permissions",
  "reset user": "/app/users?action=reset",
  "re-sync tenant": "/app/tenants?action=sync",

  // Users & support
  "add user": "/app/users?action=create",
  "invite user": "/app/users?action=create",
  "new user": "/app/users?action=create",
  users: "/app/users",
  "new ticket": "/app/tickets?action=create",
  tickets: "/app/tickets",
  knowledge: "/app/knowledge",

  // Operations
  "new client": "/app/clients?action=create",
  "add client": "/app/clients?action=create",
  clients: "/app/clients",
  "build roster": "/app/rostering?action=create",
  rostering: "/app/rostering",
  schedule: "/app/schedule",
  "new shift": "/app/schedule?action=create",
  "open shifts": "/app/open-shifts",
  "new care plan": "/app/care-plans?action=create",
  "care plans": "/app/care-plans",
  "new care note": "/app/care-notes?action=create",
  "care notes": "/app/care-notes",
  medication: "/app/medication",
  timesheets: "/app/timesheets",
  staff: "/app/staff",
  "add staff": "/app/staff?action=create",
  "auto-fill": "/app/rostering?action=autofill",
  "auto fill": "/app/rostering?action=autofill",

  // Finance
  "new invoice": "/app/invoices?action=create",
  "new claim": "/app/finance-claims?action=create",
  "record payment": "/app/payments?action=create",
  "match deposit": "/app/reconciliation?action=create",
  "update funding": "/app/client-funding?action=create",
  invoices: "/app/invoices",
  billing: "/app/billing",
  claims: "/app/claims",
  "financial overview": "/app/financial-overview",
  payments: "/app/payments",
  escalate: "/app/claim-tracking?action=escalate",

  // Compliance
  "report incident": "/app/incidents?action=create",
  incidents: "/app/incidents",
  compliance: "/app/compliance",
  "risk alerts": "/app/risk-alerts",
  audits: "/app/audits",
  policies: "/app/policies",
  training: "/app/training",

  // Comms & docs
  messages: "/app/messages",
  documents: "/app/documents",
  "upload document": "/app/documents?action=upload",
  reports: "/app/reports",
  "view all": "/app/schedule",
  "open schedule": "/app/schedule",
  "team chat": "/app/messages",
  "find replacement": "/app/open-shifts",
  "approve / reassign": "/app/timesheets",
  "review": "/app/alerts",
  export: "", // append ?action=export on current path
  download: "",

  // Family / practitioner portals
  "visit history": "/app/family-visit-history",
  "upcoming visits": "/app/family-upcoming-visits",
  "shared documents": "/app/family-documents",
  "clinical notes": "/app/practitioner-clinical-notes",
  evaluations: "/app/practitioner-evaluations",

  // Settings & misc
  settings: "/app/settings",
  profile: "/app/profile",
  "quick actions": "/app",
  "open account": "/app/tenants",
  "review pipeline": "/app/revenue",
  "open pipeline": "/app/revenue",
  activity: "/app/activity",
  "live activity": "/app/live-activity",
  alerts: "/app/alerts",
};

const normalize = (label: string) => label.trim().toLowerCase().replace(/\s+/g, " ");

export function resolveActionRoute(label: string, currentPath?: string): string | null {
  const key = normalize(label);
  const route = ROUTES[key];
  if (route === "") return currentPath ? `${currentPath}?action=export` : null;
  return route ?? null;
}

export function isCreateAction(label: string): boolean {
  const key = normalize(label);
  return (
    key.startsWith("new ") ||
    key.startsWith("add ") ||
    key.startsWith("invite ") ||
    key.startsWith("create ") ||
    key.startsWith("report ") ||
    key.startsWith("upload ")
  );
}
