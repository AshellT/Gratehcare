import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useActionQuery } from "@/hooks/useActionQuery";
import { useCareNotes, useCarePlans } from "@/hooks/useCare";
import { useClients } from "@/hooks/useClients";
import { useIncidents } from "@/hooks/useIncidents";
import { useRostering } from "@/hooks/useRostering";
import { useStaff } from "@/hooks/useStaff";
import { useTimesheets } from "@/hooks/useTimesheets";
import type {
  CareNote,
  CarePlan,
  Client,
  Incident,
  Shift,
  StaffMember,
  Timesheet,
} from "@/lib/api/types";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Filter,
  HeartPulse,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type ModuleKey =
  | "staff"
  | "clients"
  | "rostering"
  | "open-shifts"
  | "shift-conflicts"
  | "timesheets"
  | "attendance"
  | "care-plans"
  | "care-notes"
  | "medication"
  | "incidents"
  | "live-activity"
  | "alerts";

type Tone =
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "sky"
  | "slate"
  | "violet";

type OperationRecord = {
  id: string;
  primary: string;
  secondary: string;
  owner: string;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  date: string;
  location: string;
  detail: string;
  fields: Record<string, string>;
};

const moduleMeta: Record<
  ModuleKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    createLabel: string;
    tableTitle: string;
    icon: React.ReactNode;
  }
> = {
  staff: {
    eyebrow: "Workforce",
    title: "Staff",
    description:
      "Manage team members, roles, availability, credentials and workload.",
    createLabel: "Add staff",
    tableTitle: "Staff directory",
    icon: <Users className="h-5 w-5" />,
  },
  clients: {
    eyebrow: "Care operations",
    title: "Clients",
    description:
      "Client records, funding, coordinators, risks and current care status.",
    createLabel: "Add client",
    tableTitle: "Client list",
    icon: <HeartPulse className="h-5 w-5" />,
  },
  rostering: {
    eyebrow: "Scheduling",
    title: "Rostering",
    description:
      "Build rosters, assign workers and keep service coverage visible.",
    createLabel: "Create roster",
    tableTitle: "Roster runs",
    icon: <CalendarRange className="h-5 w-5" />,
  },
  "open-shifts": {
    eyebrow: "Scheduling",
    title: "Open Shifts",
    description:
      "Unfilled work that needs matching, escalation or worker offers.",
    createLabel: "Post shift",
    tableTitle: "Open shift queue",
    icon: <Clock className="h-5 w-5" />,
  },
  "shift-conflicts": {
    eyebrow: "Scheduling",
    title: "Shift Conflicts",
    description:
      "Overlaps, missing skills, expired credentials and travel risks.",
    createLabel: "Log conflict",
    tableTitle: "Conflict register",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  timesheets: {
    eyebrow: "Workforce",
    title: "Timesheets",
    description: "Submitted hours, mileage, approvals and payroll readiness.",
    createLabel: "Add timesheet",
    tableTitle: "Timesheet submissions",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  attendance: {
    eyebrow: "Workforce",
    title: "Attendance",
    description:
      "Clock-ins, missed visits, late arrivals and attendance exceptions.",
    createLabel: "Add attendance",
    tableTitle: "Attendance log",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  "care-plans": {
    eyebrow: "Care delivery",
    title: "Care Plans",
    description:
      "Goals, interventions, risks, routines and plan review cycles.",
    createLabel: "New care plan",
    tableTitle: "Care plan library",
    icon: <Stethoscope className="h-5 w-5" />,
  },
  "care-notes": {
    eyebrow: "Care delivery",
    title: "Care Notes",
    description: "Visit notes, wellbeing observations and follow-up tasks.",
    createLabel: "Write note",
    tableTitle: "Recent care notes",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  medication: {
    eyebrow: "Care delivery",
    title: "Medication",
    description:
      "Medication schedules, administrations, exceptions and reviews.",
    createLabel: "Add medication",
    tableTitle: "Medication register",
    icon: <Pill className="h-5 w-5" />,
  },
  incidents: {
    eyebrow: "Risk",
    title: "Incidents",
    description:
      "Incident reporting, investigation, severity and closure tracking.",
    createLabel: "Report incident",
    tableTitle: "Incident register",
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  "live-activity": {
    eyebrow: "Command centre",
    title: "Live Activity",
    description:
      "Real-time operational events from scheduling, care and finance.",
    createLabel: "Add update",
    tableTitle: "Live event stream",
    icon: <FileText className="h-5 w-5" />,
  },
  alerts: {
    eyebrow: "Command centre",
    title: "Alerts",
    description:
      "Actionable alerts across care, workforce, compliance and billing.",
    createLabel: "Create alert",
    tableTitle: "Alert inbox",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
};

const statusTone = (status: string): Tone => {
  const value = status.toLowerCase();
  if (
    [
      "active",
      "approved",
      "completed",
      "covered",
      "administered",
      "resolved",
    ].includes(value)
  )
    return "emerald";
  if (
    ["pending", "review", "draft", "in progress", "scheduled", "open"].includes(
      value,
    )
  )
    return "amber";
  if (
    [
      "critical",
      "overdue",
      "missed",
      "conflict",
      "unfilled",
      "escalated",
    ].includes(value)
  )
    return "rose";
  if (["sent", "offered", "published", "submitted"].includes(value))
    return "sky";
  if (["paused", "archived", "cancelled"].includes(value)) return "slate";
  return "indigo";
};

const priorityTone: Record<OperationRecord["priority"], Tone> = {
  low: "slate",
  medium: "sky",
  high: "amber",
  critical: "rose",
};

function row(
  id: string,
  primary: string,
  secondary: string,
  owner: string,
  status: string,
  priority: OperationRecord["priority"],
  date: string,
  location: string,
  detail: string,
  fields: Record<string, string>,
): OperationRecord {
  return {
    id,
    primary,
    secondary,
    owner,
    status,
    priority,
    date,
    location,
    detail,
    fields,
  };
}

const managerRoles = new Set([
  "platform_owner",
  "super_admin",
  "org_owner",
  "operations_admin",
  "care_coordinator",
  "compliance_officer",
]);

// ─── API → OperationRecord adapter hook ─────────────────────────────────────

function useModuleRecords(moduleKey: ModuleKey): OperationRecord[] {
  const staffQ = useStaff();
  const clientsQ = useClients();
  const allShiftsQ = useRostering();
  const openShiftsQ = useRostering({ status: "open" });
  const timesheetsQ = useTimesheets();
  const plansQ = useCarePlans();
  const notesQ = useCareNotes();
  const incidentsQ = useIncidents();

  return useMemo((): OperationRecord[] => {
    const fromShifts = (shifts: Shift[]): OperationRecord[] =>
      shifts.map((s) => {
        const d = new Date(s.startTime).toLocaleString("en-AU", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return row(
          s.id,
          `${s.clientName} · ${s.type.replace(/_/g, " ")}`,
          s.workerName ? `Filled by ${s.workerName}` : "No worker assigned",
          s.workerName ?? "Unassigned",
          s.status,
          s.status === "open"
            ? "high"
            : s.status === "missed"
              ? "critical"
              : "low",
          d,
          s.location ?? "—",
          `${s.type} shift. Location: ${s.location ?? "—"}.`,
          {
            Client: s.clientName,
            Worker: s.workerName ?? "—",
            Type: s.type,
            Location: s.location ?? "—",
          },
        );
      });

    switch (moduleKey) {
      case "staff": {
        const items = staffQ.data?.data;
        if (!items?.length) return [];
        return items.map((s: StaffMember) =>
          row(
            s.id,
            s.fullName,
            `${s.role.replace(/_/g, " ")} · ${s.hoursPerWeek ?? 0}h/wk`,
            "HR",
            s.status,
            s.credentialsExpiry ? "high" : "low",
            s.credentialsExpiry ?? "Active",
            "—",
            `${s.hoursPerWeek ?? 0}h/wk rostered. Skills: ${s.skills?.join(", ") ?? "—"}.`,
            {
              Role: s.role,
              Status: s.status,
              "Hours/wk": String(s.hoursPerWeek ?? 0),
              Skills: s.skills?.join(", ") ?? "—",
            },
          ),
        );
      }
      case "clients": {
        const items = clientsQ.data?.data;
        if (!items?.length) return [];
        return items.map((c: Client) =>
          row(
            c.id,
            c.fullName,
            `${c.funding} · ${c.hoursPerWeek != null ? c.hoursPerWeek + "h/wk" : "—"}`,
            c.coordinator ?? "—",
            c.status,
            c.riskLevel === "high"
              ? "high"
              : c.riskLevel === "medium"
                ? "medium"
                : "low",
            c.since,
            "—",
            `Client since ${c.since}. Funding: ${c.funding}. Risk: ${c.riskLevel ?? "—"}.`,
            {
              Funding: c.funding,
              Coordinator: c.coordinator ?? "—",
              Since: c.since,
              Risk: c.riskLevel ?? "—",
            },
          ),
        );
      }
      case "rostering": {
        const items = allShiftsQ.data?.data;
        if (!items?.length) return [];
        return fromShifts(items);
      }
      case "open-shifts": {
        const items = openShiftsQ.data?.data;
        if (!items?.length) return [];
        return fromShifts(items.filter((s: Shift) => s.status === "open"));
      }
      case "timesheets": {
        const items = timesheetsQ.data?.data;
        if (!items?.length) return [];
        return items.map((t: Timesheet) =>
          row(
            t.id,
            t.staffName,
            `${t.hoursWorked}h · ${t.status}`,
            "Payroll",
            t.status,
            t.status === "draft" ? "medium" : "low",
            t.weekStarting,
            "—",
            `Week of ${t.weekStarting}. ${t.hoursWorked} hours. Mileage: ${t.mileage ?? 0}km.`,
            {
              Staff: t.staffName,
              Hours: String(t.hoursWorked),
              Mileage: `${t.mileage ?? 0}km`,
              Status: t.status,
            },
          ),
        );
      }
      case "care-plans": {
        const items = plansQ.data?.data;
        if (!items?.length) return [];
        return items.map((p: CarePlan) =>
          row(
            p.id,
            `${p.clientName} care plan`,
            `Review due ${p.nextReviewAt ?? "—"}`,
            p.coordinator,
            p.status === "review_due" ? "review" : p.status,
            p.status === "review_due" ? "high" : "low",
            p.nextReviewAt ?? "—",
            "—",
            `Goals: ${p.goals.join(", ")}. Last reviewed: ${p.lastReviewedAt ?? "—"}.`,
            {
              Client: p.clientName,
              Coordinator: p.coordinator,
              "Last review": p.lastReviewedAt ?? "—",
              "Next review": p.nextReviewAt ?? "—",
            },
          ),
        );
      }
      case "care-notes": {
        const items = notesQ.data?.data;
        if (!items?.length) return [];
        return items.map((n: CareNote) =>
          row(
            n.id,
            `${n.clientName} visit note`,
            n.content.length > 60 ? n.content.slice(0, 60) + "…" : n.content,
            n.workerName,
            n.flagged ? "review" : "completed",
            n.flagged ? "high" : "low",
            n.visitDate,
            "—",
            n.content,
            {
              Client: n.clientName,
              Worker: n.workerName,
              Mood: n.mood ?? "—",
              Date: n.visitDate,
            },
          ),
        );
      }
      case "incidents": {
        const items = incidentsQ.data?.data;
        if (!items?.length) return [];
        return items.map((i: Incident) =>
          row(
            i.reference,
            i.summary.length > 60 ? i.summary.slice(0, 60) + "…" : i.summary,
            `${i.type} · ${i.clientName}`,
            i.reportedBy,
            i.status,
            i.severity as OperationRecord["priority"],
            new Date(i.occurredAt).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
            }),
            "—",
            i.summary,
            {
              Client: i.clientName,
              Type: i.type,
              Severity: i.severity,
              Reporter: i.reportedBy,
            },
          ),
        );
      }
      default:
        return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    moduleKey,
    staffQ.data,
    clientsQ.data,
    allShiftsQ.data,
    openShiftsQ.data,
    timesheetsQ.data,
    plansQ.data,
    notesQ.data,
    incidentsQ.data,
  ]);
}

const canManageModule = (role: string | undefined, module: ModuleKey) => {
  if (!role) return false;
  if (role === "family") return false;
  if (role === "support_worker")
    return ["timesheets", "attendance", "care-notes"].includes(module);
  if (role === "practitioner")
    return ["clients", "care-plans", "care-notes", "medication"].includes(
      module,
    );
  if (role === "billing_officer") return false;
  if (module === "incidents" || module === "alerts")
    return managerRoles.has(role) || role === "platform_support";
  return managerRoles.has(role);
};

const OperationModulePage: React.FC<{ moduleKey: ModuleKey }> = ({
  moduleKey,
}) => {
  const { user } = useAuth();
  const meta = moduleMeta[moduleKey];
  const liveRecords = useModuleRecords(moduleKey);
  const [records, setRecords] = useState<OperationRecord[]>(() => liveRecords);
  useEffect(() => {
    setRecords(liveRecords);
  }, [liveRecords]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [priority, setPriority] = useState("All priorities");
  const [selected, setSelected] = useState<OperationRecord | null>(null);
  const [editing, setEditing] = useState<OperationRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canManage = canManageModule(user?.role, moduleKey);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2600);
  };

  useActionQuery("create", () => setShowCreate(true));
  useActionQuery("autofill", () => notify("Auto-fill suggestions applied to open shifts."));

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const text =
        `${record.id} ${record.primary} ${record.secondary} ${record.owner} ${record.location}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase());
      const matchesStatus =
        status === "All statuses" || record.status === status;
      const matchesPriority =
        priority === "All priorities" || record.priority === priority;
      return matchesText && matchesStatus && matchesPriority;
    });
  }, [priority, query, records, status]);

  const statuses = Array.from(new Set(records.map((record) => record.status)));
  const criticalCount = records.filter(
    (record) => record.priority === "critical" || record.status === "critical",
  ).length;

  const createRecord = (form: FormState) => {
    const next = row(
      `${moduleKey.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 8000) + 1200}`,
      form.primary,
      form.secondary,
      form.owner,
      form.status,
      form.priority,
      form.date,
      form.location,
      form.detail,
      {
        Owner: form.owner,
        Location: form.location,
        Source: "Manual",
        Review: "Pending",
      },
    );
    setRecords((items) => [next, ...items]);
    setShowCreate(false);
    notify(`${next.primary} created.`);
  };

  const updateRecord = (form: FormState) => {
    if (!editing) return;
    const next = { ...editing, ...form };
    setRecords((items) =>
      items.map((item) => (item.id === editing.id ? next : item)),
    );
    setEditing(null);
    setSelected(next);
    notify(`${next.id} updated.`);
  };

  const closeRecord = (record: OperationRecord) => {
    const closed = {
      ...record,
      status: moduleKey === "open-shifts" ? "covered" : "resolved",
      priority: "low" as const,
    };
    setRecords((items) =>
      items.map((item) => (item.id === record.id ? closed : item)),
    );
    setSelected(closed);
    notify(`${record.id} marked ${closed.status}.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={
          canManage
            ? meta.description
            : `${meta.description} Read-only access for your role.`
        }
        actions={[
          {
            label: "Export",
            variant: "secondary",
            icon: <Download className="h-4 w-4" />,
            onClick: () => notify(`${meta.title} export prepared.`),
          },
          ...(canManage
            ? [
                {
                  label: meta.createLabel,
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => setShowCreate(true),
                },
              ]
            : []),
        ]}
      />

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total records"
          value={`${records.length}`}
          tone="indigo"
          icon={meta.icon}
          index={0}
        />
        <StatCard
          label="Visible now"
          value={`${filtered.length}`}
          tone="sky"
          icon={<Filter className="h-5 w-5" />}
          index={1}
        />
        <StatCard
          label="Critical"
          value={`${criticalCount}`}
          tone={criticalCount ? "rose" : "emerald"}
          icon={<AlertTriangle className="h-5 w-5" />}
          index={2}
        />
        <StatCard
          label="Action access"
          value={canManage ? "Full" : "View"}
          tone={canManage ? "emerald" : "slate"}
          icon={<CheckCircle2 className="h-5 w-5" />}
          index={3}
        />
      </div>

      <Card
        title={meta.tableTitle}
        description={`${filtered.length} of ${records.length} records shown`}
        action={
          <button
            onClick={() => {
              setQuery("");
              setStatus("All statuses");
              setPriority("All priorities");
              notify("Filters reset.");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset filters
          </button>
        }
      >
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${meta.title.toLowerCase()}...`}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {["All statuses", ...statuses].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {["All priorities", "low", "medium", "high", "critical"].map(
              (option) => (
                <option key={option}>{option}</option>
              ),
            )}
          </select>
          <button
            onClick={() =>
              notify("Saved operational views opened in demo mode.")
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Saved views
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">
              No matching records
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Adjust filters or create a new record to continue.
            </p>
            {canManage && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                {meta.createLabel}
              </button>
            )}
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Record</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-bold text-indigo-600">
                        {record.id}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {record.primary}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.secondary}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {record.owner}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {record.date}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {record.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={priorityTone[record.priority]} dot>
                        {record.priority}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(record.status)} dot>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(record)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {canManage ? "Review" : "View"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <DetailDrawer
          moduleTitle={meta.title}
          record={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onResolve={() => closeRecord(selected)}
          onNotify={notify}
        />
      )}

      {showCreate && (
        <RecordFormDrawer
          title={meta.createLabel}
          moduleKey={moduleKey}
          onClose={() => setShowCreate(false)}
          onSubmit={createRecord}
        />
      )}

      {editing && (
        <RecordFormDrawer
          title={`Edit ${editing.id}`}
          moduleKey={moduleKey}
          record={editing}
          onClose={() => setEditing(null)}
          onSubmit={updateRecord}
        />
      )}
    </div>
  );
};

type FormState = {
  primary: string;
  secondary: string;
  owner: string;
  status: string;
  priority: OperationRecord["priority"];
  date: string;
  location: string;
  detail: string;
};

const RecordFormDrawer: React.FC<{
  title: string;
  moduleKey: ModuleKey;
  record?: OperationRecord;
  onClose: () => void;
  onSubmit: (form: FormState) => void;
}> = ({ title, moduleKey, record, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>({
    primary: record?.primary || "",
    secondary: record?.secondary || "",
    owner: record?.owner || "",
    status: record?.status || "open",
    priority: record?.priority || "medium",
    date: record?.date || "Today",
    location: record?.location || "",
    detail: record?.detail || "",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-900/30">
      <button
        className="flex-1 cursor-default"
        aria-label="Close form"
        onClick={onClose}
      />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              {moduleMeta[moduleKey].title}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.primary.trim() || !form.owner.trim()) {
              setError("Primary name and owner are required.");
              return;
            }
            onSubmit(form);
          }}
        >
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
              {error}
            </div>
          )}
          <Field
            label="Primary name"
            value={form.primary}
            onChange={(value) => update("primary", value)}
          />
          <Field
            label="Summary"
            value={form.secondary}
            onChange={(value) => update("secondary", value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Owner"
              value={form.owner}
              onChange={(value) => update("owner", value)}
            />
            <Field
              label="Date"
              value={form.date}
              onChange={(value) => update("date", value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="text-xs font-semibold text-slate-700">
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(event) => update("priority", event.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                {["low", "medium", "high", "critical"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <Field
              label="Status"
              value={form.status}
              onChange={(value) => update("status", value)}
            />
          </div>
          <Field
            label="Location"
            value={form.location}
            onChange={(value) => update("location", value)}
          />
          <label>
            <span className="text-xs font-semibold text-slate-700">Detail</span>
            <textarea
              value={form.detail}
              onChange={(event) => update("detail", event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label>
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </label>
);

const DetailDrawer: React.FC<{
  moduleTitle: string;
  record: OperationRecord;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onResolve: () => void;
  onNotify: (message: string) => void;
}> = ({
  moduleTitle,
  record,
  canManage,
  onClose,
  onEdit,
  onResolve,
  onNotify,
}) => (
  <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/30">
    <button
      className="flex-1 cursor-default"
      aria-label="Close details"
      onClick={onClose}
    />
    <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            {moduleTitle}
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
            {record.primary}
          </h2>
          <p className="mt-1 font-mono text-xs font-bold text-slate-500">
            {record.id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone(record.status)} dot>
            {record.status}
          </Badge>
          <Badge tone={priorityTone[record.priority]} dot>
            {record.priority}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          {record.detail}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Info label="Owner" value={record.owner} />
          <Info label="Date" value={record.date} />
          <Info label="Location" value={record.location} />
          <Info label="Summary" value={record.secondary} />
        </div>
        <Card title="Operational details">
          <div className="grid gap-3">
            {Object.entries(record.fields).map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-slate-600">{label}</span>
                <span className="text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Activity">
          <ol className="space-y-3 text-sm text-slate-600">
            {[
              "Record opened",
              "Validation checks complete",
              "Assigned owner notified",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNotify(`${record.id} exported.`)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Export
          </button>
          {canManage && (
            <>
              <button
                onClick={onEdit}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Edit
              </button>
              <button
                onClick={onResolve}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Resolve
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  </div>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label}
    </div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

export const StaffPage = () => <OperationModulePage moduleKey="staff" />;
export const OperationalClientsPage = () => (
  <OperationModulePage moduleKey="clients" />
);
export const RosteringPage = () => (
  <OperationModulePage moduleKey="rostering" />
);
export const OpenShiftsPage = () => (
  <OperationModulePage moduleKey="open-shifts" />
);
export const ShiftConflictsPage = () => (
  <OperationModulePage moduleKey="shift-conflicts" />
);
export const TimesheetsPage = () => (
  <OperationModulePage moduleKey="timesheets" />
);
export const AttendancePage = () => (
  <OperationModulePage moduleKey="attendance" />
);
export const CarePlansPage = () => (
  <OperationModulePage moduleKey="care-plans" />
);
export const CareNotesPage = () => (
  <OperationModulePage moduleKey="care-notes" />
);
export const MedicationPage = () => (
  <OperationModulePage moduleKey="medication" />
);
export const OperationalIncidentsPage = () => (
  <OperationModulePage moduleKey="incidents" />
);
export const LiveActivityPage = () => (
  <OperationModulePage moduleKey="live-activity" />
);
export const AlertsPage = () => <OperationModulePage moduleKey="alerts" />;
