import { apiClient } from "./client";

// ─── Field schema ───────────────────────────────────────────────────────────
// Each module renders its own set of fields. Values are kept as a flat
// Record<string, string> keyed by `name`; the payload builders below translate
// them into the generic tenant-record DTO the backend expects
// ({ title, description, status, severity, metadata }).

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "client"
  | "staff";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  half?: boolean;
  createOnly?: boolean;
};

export type ModuleValues = Record<string, string>;

const RECORD_STATUS = ["ACTIVE", "PENDING", "REVIEW", "ARCHIVED"];
const SEVERITY = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const moduleFields: Record<string, FieldDef[]> = {
  staff: [
    { name: "fullName", label: "Full name", type: "text", required: true },
    {
      name: "email",
      label: "Work email",
      type: "email",
      required: true,
      createOnly: true,
      placeholder: "alex@yourorg.com",
      help: "Used to sign in. An invite is sent if you leave the password blank.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: ["SUPPORT_WORKER", "CARE_COORDINATOR"],
      required: true,
      half: true,
      createOnly: true,
    },
    {
      name: "password",
      label: "Temporary password",
      type: "password",
      createOnly: true,
      half: true,
      placeholder: "Optional",
      help: "Leave blank to email a set-password link instead.",
    },
    {
      name: "skills",
      label: "Skills",
      type: "text",
      placeholder: "Manual handling, Medication, First aid",
      help: "Comma separated",
    },
    { name: "status", label: "Status", type: "select", options: RECORD_STATUS, half: true },
  ],
  clients: [
    { name: "fullName", label: "Full name", type: "text", required: true },
    {
      name: "funding",
      label: "Funding",
      type: "select",
      options: ["NDIS", "Aged Care (HCP)", "CHSP", "DVA", "Private"],
      half: true,
    },
    { name: "riskLevel", label: "Risk level", type: "select", options: SEVERITY, half: true },
    { name: "status", label: "Status", type: "select", options: RECORD_STATUS, half: true },
    {
      name: "familyName",
      label: "Family contact name",
      type: "text",
      createOnly: true,
      placeholder: "Optional",
    },
    {
      name: "familyEmail",
      label: "Family contact email",
      type: "email",
      createOnly: true,
      placeholder: "Optional — invites the family portal",
      help: "The client does not get a login. This email is for a family member.",
    },
    {
      name: "familyPassword",
      label: "Family password",
      type: "password",
      createOnly: true,
      placeholder: "Optional",
      help: "Leave blank to email a set-password link.",
    },
  ],
  rostering: [
    {
      name: "service",
      label: "Service / shift type",
      type: "text",
      required: true,
      placeholder: "Personal care, Community access…",
    },
    { name: "client", label: "Client", type: "client", required: true },
    { name: "worker", label: "Worker", type: "staff", help: "Leave empty for an open shift" },
    { name: "startsAt", label: "Start", type: "datetime", required: true, half: true },
    { name: "endsAt", label: "End", type: "datetime", required: true, half: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ],
  "open-shifts": [
    {
      name: "service",
      label: "Service / shift type",
      type: "text",
      required: true,
      placeholder: "Personal care, Community access…",
    },
    { name: "client", label: "Client", type: "client", required: true },
    { name: "startsAt", label: "Start", type: "datetime", required: true, half: true },
    { name: "endsAt", label: "End", type: "datetime", required: true, half: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ],
  timesheets: [
    { name: "staff", label: "Staff member", type: "staff", required: true },
    { name: "hours", label: "Hours worked", type: "number", required: true, half: true },
    { name: "mileage", label: "Mileage (km)", type: "number", half: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["PENDING", "REVIEW", "APPROVED"],
      half: true,
    },
  ],
  "care-plans": [
    { name: "title", label: "Plan title", type: "text", required: true },
    { name: "client", label: "Client", type: "client", required: true },
    { name: "goals", label: "Goals", type: "textarea", help: "One goal per line" },
    { name: "reviewDue", label: "Review due", type: "date", half: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["DRAFT", "ACTIVE", "REVIEW"],
      half: true,
    },
  ],
  "care-notes": [
    { name: "title", label: "Note title", type: "text", required: true },
    { name: "client", label: "Client", type: "client", required: true },
    { name: "author", label: "Author", type: "staff" },
    { name: "body", label: "Note", type: "textarea", required: true },
    {
      name: "sharedWithFamily",
      label: "Shared with family",
      type: "select",
      options: ["No", "Yes"],
      half: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["ACTIVE", "DRAFT", "REVIEW"],
      half: true,
    },
  ],
  medication: [
    { name: "name", label: "Medication name", type: "text", required: true },
    { name: "client", label: "Client", type: "client", required: true },
    { name: "dosage", label: "Dosage", type: "text", placeholder: "e.g. 5mg", half: true },
    {
      name: "schedule",
      label: "Schedule",
      type: "text",
      placeholder: "e.g. 8am daily",
      half: true,
    },
    { name: "status", label: "Status", type: "select", options: RECORD_STATUS, half: true },
  ],
  incidents: [
    { name: "title", label: "Summary", type: "text", required: true },
    { name: "client", label: "Client", type: "client" },
    { name: "details", label: "Details", type: "textarea" },
    { name: "severity", label: "Severity", type: "select", options: SEVERITY, required: true, half: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["PENDING", "REVIEW", "COMPLETED"],
      half: true,
    },
    { name: "occurredAt", label: "Occurred at", type: "datetime", half: true },
  ],
};

export const CREATABLE_MODULES = new Set(Object.keys(moduleFields));

// ─── Payload builders ─────────────────────────────────────────────────────────

const text = (v?: string) => {
  const s = (v ?? "").trim();
  return s.length ? s : undefined;
};
const num = (v?: string) => {
  const n = Number(v);
  return v != null && v !== "" && Number.isFinite(n) ? n : undefined;
};
const lines = (v?: string) =>
  (v ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

type TenantRecordPayload = {
  title?: string;
  description?: string;
  status?: string;
  severity?: string;
  metadata?: Record<string, unknown>;
};

const compact = (obj: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** Translate flat form values into the backend tenant-record DTO. */
function buildPayload(moduleKey: string, v: ModuleValues): TenantRecordPayload {
  switch (moduleKey) {
    case "staff":
      return {
        title: text(v.fullName),
        status: text(v.status),
        metadata: compact({
          skills: lines(v.skills),
          email: text(v.email),
          password: text(v.password),
          role: text(v.role),
        }),
      };
    case "clients":
      return {
        title: text(v.fullName),
        status: text(v.status),
        severity: text(v.riskLevel),
        metadata: compact({
          funding: text(v.funding),
          coordinatorUserId: text(v.coordinatorUserId),
          familyName: text(v.familyName),
          familyEmail: text(v.familyEmail),
          familyPassword: text(v.familyPassword),
        }),
      };
    case "rostering":
    case "open-shifts":
      return {
        title: text(v.service),
        description: text(v.notes),
        metadata: compact({
          clientId: text(v.client),
          staffId: text(v.worker),
          startsAt: text(v.startsAt),
          endsAt: text(v.endsAt),
        }),
      };
    case "timesheets":
      return {
        title: "Timesheet",
        status: text(v.status),
        metadata: compact({ staffId: text(v.staff), hours: num(v.hours) ?? 0, mileage: num(v.mileage) }),
      };
    case "care-plans":
      return {
        title: text(v.title),
        status: text(v.status),
        metadata: compact({
          clientId: text(v.client),
          goals: lines(v.goals),
          reviewDue: text(v.reviewDue),
        }),
      };
    case "care-notes":
      return {
        title: text(v.title),
        description: text(v.body),
        status: text(v.status),
        metadata: compact({
          clientId: text(v.client),
          staffId: text(v.author),
          sharedWithFamily: v.sharedWithFamily === "Yes",
        }),
      };
    case "medication":
      return {
        title: text(v.name),
        description: text(v.schedule),
        status: text(v.status),
        metadata: compact({ clientId: text(v.client), dosage: text(v.dosage) }),
      };
    case "incidents":
      return {
        title: text(v.title),
        description: text(v.details),
        severity: text(v.severity),
        status: text(v.status),
        metadata: compact({ clientId: text(v.client), occurredAt: text(v.occurredAt) }),
      };
    default:
      throw new Error(`Module not supported: ${moduleKey}`);
  }
}

const ENDPOINTS: Record<string, string> = {
  staff: "/staff",
  clients: "/clients",
  rostering: "/rostering",
  "open-shifts": "/rostering",
  timesheets: "/timesheets",
  "care-plans": "/care-plans",
  "care-notes": "/care-notes",
  medication: "/medication",
  incidents: "/incidents",
};

export async function createModuleRecord(moduleKey: string, values: ModuleValues) {
  const endpoint = ENDPOINTS[moduleKey];
  if (!endpoint) throw new Error(`Create is not supported for module: ${moduleKey}`);
  const payload = buildPayload(moduleKey, values);
  return apiClient.post(endpoint, payload as Record<string, unknown>);
}

export async function updateModuleRecord(
  moduleKey: string,
  id: string,
  values: ModuleValues,
) {
  const endpoint = ENDPOINTS[moduleKey];
  if (!endpoint) throw new Error(`Update is not supported for module: ${moduleKey}`);
  const payload = buildPayload(moduleKey, values);
  return apiClient.patch(`${endpoint}/${id}`, payload as Record<string, unknown>);
}
