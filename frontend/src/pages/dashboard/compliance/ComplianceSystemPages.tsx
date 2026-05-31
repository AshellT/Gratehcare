import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileBadge,
  FileCheck2,
  FileClock,
  Filter,
  GraduationCap,
  History,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { complianceApi } from "@/lib/api/compliance";
import { incidentsApi } from "@/lib/api/incidents";
import { useToast } from "@/context/ToastContext";
import type { ComplianceEvent, Incident } from "@/lib/api/types";

type ComplianceKey =
  | "overview"
  | "events"
  | "risk-alerts"
  | "credentials"
  | "training"
  | "expiry"
  | "incidents"
  | "investigations"
  | "audit-logs"
  | "policies"
  | "corrective-actions";

type Tone = "emerald" | "amber" | "rose" | "indigo" | "sky" | "slate" | "violet";
type Severity = "low" | "medium" | "high" | "critical";

type ComplianceRecord = {
  id: string;
  subject: string;
  category: string;
  owner: string;
  severity: Severity;
  status: string;
  due: string;
  evidence: string;
  summary: string;
  workflow: string[];
  timeline: { when: string; title: string; detail: string }[];
  actions: { task: string; owner: string; due: string; status: string }[];
  audit: { when: string; actor: string; event: string }[];
};

const meta: Record<
  ComplianceKey,
  { eyebrow: string; title: string; description: string; createLabel: string; tableTitle: string; icon: React.ReactNode }
> = {
  overview: {
    eyebrow: "Compliance",
    title: "Compliance Overview",
    description: "Executive compliance posture, open risk, audit readiness and evidence health.",
    createLabel: "New compliance event",
    tableTitle: "Compliance command queue",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  events: {
    eyebrow: "Compliance",
    title: "Compliance Events",
    description: "Operational compliance events requiring triage, evidence or follow-up.",
    createLabel: "Log event",
    tableTitle: "Compliance event register",
    icon: <FileClock className="h-5 w-5" />,
  },
  "risk-alerts": {
    eyebrow: "Risk",
    title: "Risk Alerts",
    description: "Severity-scored alerts across credentials, incidents, medication and service quality.",
    createLabel: "Create alert",
    tableTitle: "Risk alert inbox",
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  credentials: {
    eyebrow: "Workforce compliance",
    title: "Staff Credentials",
    description: "Credential status, verification, evidence files and renewal accountability.",
    createLabel: "Add credential",
    tableTitle: "Credential register",
    icon: <UserCheck className="h-5 w-5" />,
  },
  training: {
    eyebrow: "Workforce compliance",
    title: "Training Records",
    description: "Mandatory learning, competency status, refresher due dates and proof of completion.",
    createLabel: "Assign training",
    tableTitle: "Training matrix",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  expiry: {
    eyebrow: "Workforce compliance",
    title: "Expiry Tracking",
    description: "Renewal calendar for credentials, policies, authorisations and contracts.",
    createLabel: "Add expiry",
    tableTitle: "Expiry tracker",
    icon: <FileClock className="h-5 w-5" />,
  },
  incidents: {
    eyebrow: "Risk",
    title: "Incident Register",
    description: "Incident intake, classification, evidence, investigation and closure.",
    createLabel: "Report incident",
    tableTitle: "Incident register",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  investigations: {
    eyebrow: "Risk",
    title: "Investigations",
    description: "Root cause analysis, witness notes, findings and sign-off workflows.",
    createLabel: "Open investigation",
    tableTitle: "Investigation tracker",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  "audit-logs": {
    eyebrow: "Audit",
    title: "Audit Logs",
    description: "Immutable record of compliance actions, evidence exports and approvals.",
    createLabel: "Add audit note",
    tableTitle: "Audit trail",
    icon: <History className="h-5 w-5" />,
  },
  policies: {
    eyebrow: "Governance",
    title: "Policy Tracking",
    description: "Policy versions, acknowledgements, review owners and approval status.",
    createLabel: "New policy",
    tableTitle: "Policy register",
    icon: <BookOpen className="h-5 w-5" />,
  },
  "corrective-actions": {
    eyebrow: "Risk",
    title: "Corrective Actions",
    description: "CAPA ownership, due dates, verification and effectiveness checks.",
    createLabel: "Create action",
    tableTitle: "Corrective action plan",
    icon: <FileCheck2 className="h-5 w-5" />,
  },
};

const records: ComplianceRecord[] = [
  rec("CMP-910", "Medication authority missing", "Medication", "Sara Hill", "critical", "open", "Today 17:00", "2 files pending", "Onboarding medication authority is missing for Maya Krishnan before first support visit.", ["Triage", "Evidence requested", "Coordinator assigned", "Awaiting verification"], "Upload signed medication authority"),
  rec("CRD-804", "James McGuire first aid renewal", "Credential", "Compliance", "high", "in progress", "Apr 30", "Certificate requested", "First aid certificate expires in 4 days and blocks high-intensity support assignments.", ["Detected", "Worker notified", "Renewal booked", "Evidence pending"], "Verify renewed certificate"),
  rec("TRN-612", "Medication competency refresher", "Training", "Olivia Grant", "medium", "scheduled", "May 03", "LMS record", "Seven support workers need annual medication competency refresher.", ["Assigned", "Worker reminders sent", "Completion tracking", "Manager sign-off"], "Confirm completion rate"),
  rec("INC-620", "Late attendance escalation", "Incident", "Daniel Wu", "medium", "review", "Today", "Visit log attached", "Worker arrived late due to traffic; family notified and service completed.", ["Incident logged", "Family notified", "Coordinator review", "Close-out pending"], "Complete incident review"),
  rec("POL-144", "Medication management policy", "Policy", "Clinical Governance", "medium", "review", "May 12", "Version 4.2", "Policy requires annual review and acknowledgement refresh.", ["Draft reviewed", "Clinical sign-off", "Staff acknowledgement", "Publish"], "Send acknowledgement campaign"),
  rec("AUD-301", "Quarterly quality audit", "Audit", "Quality Team", "high", "open", "May 08", "Evidence pack 72%", "Quarterly audit has three evidence gaps in training and incident close-out.", ["Scope confirmed", "Evidence collection", "Sample testing", "Management response"], "Close evidence gaps"),
  rec("CAPA-220", "Reduce missed clock-in events", "Corrective action", "Operations", "high", "in progress", "May 15", "Dashboard trend", "Attendance monitor found repeated missed clock-ins across two regions.", ["Root cause confirmed", "Action plan approved", "Implementation", "Effectiveness check"], "Run mobile check-in coaching"),
  rec("EXP-510", "NDIS clearance batch", "Expiry", "Compliance", "high", "open", "May 01", "Renewal list", "Four NDIS worker screenings expire within 14 days.", ["Expiry detected", "Renewals requested", "Escalation window", "Verification"], "Escalate renewals"),
];


const categoryLabel = (value: string) => {
  const map: Record<string, string> = {
    credential: 'Credential',
    training: 'Training',
    policy: 'Policy',
    corrective_action: 'Corrective action',
    medication: 'Medication',
    incident: 'Incident',
    audit: 'Audit',
    expiry: 'Expiry',
    compliance: 'Compliance',
  };
  return map[value] ?? value.replace(/_/g, ' ').replace(/^w/, (m) => m.toUpperCase());
};

const mapComplianceEvent = (event: ComplianceEvent): ComplianceRecord =>
  rec(
    event.id,
    event.title,
    categoryLabel(event.category),
    event.assignee ?? 'Unassigned',
    event.severity,
    event.status.replace(/_/g, ' '),
    event.dueDate,
    '—',
    event.title,
    ['Triage', 'Evidence', 'Review', 'Close'],
    'Review record',
  );

const mapIncident = (incident: Incident): ComplianceRecord =>
  rec(
    incident.reference,
    incident.summary,
    'Incident',
    incident.reportedBy,
    incident.severity,
    incident.status,
    new Date(incident.occurredAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }),
    '—',
    incident.summary,
    ['Logged', 'Investigation', 'Review', 'Close'],
    'Complete review',
  );

function rec(
  id: string,
  subject: string,
  category: string,
  owner: string,
  severity: Severity,
  status: string,
  due: string,
  evidence: string,
  summary: string,
  workflow: string[],
  actionTask: string,
): ComplianceRecord {
  return {
    id,
    subject,
    category,
    owner,
    severity,
    status,
    due,
    evidence,
    summary,
    workflow,
    timeline: [
      { when: "09:10", title: "Record created", detail: `${category} record opened and assigned to ${owner}.` },
      { when: "10:35", title: "Evidence reviewed", detail: "Evidence checklist was compared with policy requirements." },
      { when: "12:20", title: "Investigation note", detail: "Initial risk assessment completed and workflow advanced." },
    ],
    actions: [
      { task: actionTask, owner, due, status: status === "open" ? "not started" : "in progress" },
      { task: "Attach supporting evidence", owner: "Quality Team", due: "Tomorrow", status: "pending" },
      { task: "Manager verification", owner: "Operations Lead", due: "This week", status: "pending" },
    ],
    audit: [
      { when: "Today 09:10", actor: "System", event: "Record created from compliance rules engine" },
      { when: "Today 10:35", actor: owner, event: "Severity and workflow owner confirmed" },
      { when: "Today 12:20", actor: "Quality Team", event: "Evidence checklist updated" },
    ],
  };
}

const severityTone: Record<Severity, Tone> = {
  low: "slate",
  medium: "sky",
  high: "amber",
  critical: "rose",
};

const statusTone = (status: string): Tone => {
  if (["closed", "resolved", "verified", "complete"].includes(status)) return "emerald";
  if (["in progress", "review", "scheduled", "pending"].includes(status)) return "amber";
  if (["open", "overdue", "critical"].includes(status)) return "rose";
  return "indigo";
};

const pageRecords = (key: ComplianceKey, source: ComplianceRecord[]) => {
  if (key === "overview") return source;
  if (key === "events") return source.filter((r) => ["Compliance", "Medication", "Expiry"].includes(r.category));
  if (key === "risk-alerts") return source.filter((r) => ["high", "critical"].includes(r.severity));
  if (key === "credentials") return source.filter((r) => r.category === "Credential");
  if (key === "training") return source.filter((r) => r.category === "Training");
  if (key === "expiry") return source.filter((r) => ["Expiry", "Credential", "Policy"].includes(r.category));
  if (key === "incidents") return source.filter((r) => r.category === "Incident");
  if (key === "investigations") return source.filter((r) => ["Incident", "Audit", "Corrective action"].includes(r.category));
  if (key === "audit-logs") return source.filter((r) => ["Audit", "Policy", "Compliance"].includes(r.category));
  if (key === "policies") return source.filter((r) => r.category === "Policy");
  return source.filter((r) => r.category === "Corrective action");
};

const managerRoles = new Set(["platform_owner", "super_admin", "org_owner", "operations_admin", "compliance_officer"]);

const ComplianceSystemPage: React.FC<{ pageKey: ComplianceKey }> = ({ pageKey }) => {
  const { user } = useAuth();
  const toast = useToast();
  const page = meta[pageKey];
  const [items, setItems] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All severities");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<ComplianceRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canManage = managerRoles.has(user?.role || "");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const useIncidents = pageKey === "incidents" || pageKey === "investigations";
        if (useIncidents) {
          const res = await incidentsApi.list();
          if (!mounted) return;
          setItems((res.data ?? []).map(mapIncident));
        } else {
          const res = await complianceApi.listEvents();
          if (!mounted) return;
          setItems((res.data ?? []).map(mapComplianceEvent));
        }
      } catch {
        if (mounted) {
          toast.error("Failed to load compliance data", "Could not fetch records from backend.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pageKey, toast]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2600);
  };

  const scopedItems = useMemo(() => pageRecords(pageKey, items), [items, pageKey]);

  const filtered = useMemo(
    () =>
      scopedItems.filter((item) => {
        const text = `${item.id} ${item.subject} ${item.category} ${item.owner}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (severity === "All severities" || item.severity === severity) &&
          (status === "All statuses" || item.status === status)
        );
      }),
    [scopedItems, query, severity, status],
  );

  const critical = scopedItems.filter((item) => item.severity === "critical").length;
  const open = scopedItems.filter((item) => ["open", "review", "in progress"].includes(item.status)).length;
  const evidenceReady = scopedItems.length === 0 ? 0 : Math.max(0, 100 - open * 5);

  const createRecord = (form: FormState) => {
    const next = rec(
      `CMP-${Math.floor(Math.random() * 8000) + 1200}`,
      form.subject,
      form.category,
      form.owner,
      form.severity,
      "open",
      form.due,
      "Evidence pending",
      form.summary,
      ["Triage", "Evidence request", "Investigation", "Sign-off"],
      form.action,
    );
    setItems((current) => [next, ...current]);
    setShowForm(false);
    notify(`${next.subject} created and assigned.`);
  };

  const advanceWorkflow = (record: ComplianceRecord) => {
    const next = {
      ...record,
      status: record.status === "open" ? "in progress" : record.status === "in progress" ? "review" : "closed",
      audit: [
        ...record.audit,
        { when: "Now", actor: user?.name || "Current user", event: "Workflow advanced from detail drawer" },
      ],
    };
    setItems((current) => current.map((item) => (item.id === record.id ? next : item)));
    setSelected(next);
    notify(`${record.id} workflow advanced.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        description={canManage ? page.description : `${page.description} View-only access for your role.`}
        actions={[
          {
            label: "Export evidence",
            variant: "secondary",
            icon: <Download className="h-4 w-4" />,
            onClick: () => notify(`${page.title} evidence pack exported.`),
          },
          ...(canManage
            ? [{ label: page.createLabel, icon: <Plus className="h-4 w-4" />, onClick: () => setShowForm(true) }]
            : []),
        ]}
      />

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Compliance score" value={`${evidenceReady}%`} tone="emerald" icon={page.icon} index={0} />
        <StatCard label="Open workflows" value={`${open}`} tone="amber" icon={<FileClock className="h-5 w-5" />} index={1} />
        <StatCard label="Critical risk" value={`${critical}`} tone={critical ? "rose" : "emerald"} icon={<ShieldAlert className="h-5 w-5" />} index={2} />
        <StatCard label="Evidence ready" value={`${evidenceReady}%`} tone="indigo" icon={<FileBadge className="h-5 w-5" />} index={3} />
      </div>

      <Card
        title={page.tableTitle}
        description={loading ? "Loading..." : `${filtered.length} records visible`}
        action={
          <button
            onClick={() => {
              setQuery("");
              setSeverity("All severities");
              setStatus("All statuses");
              notify("Compliance filters reset.");
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
              placeholder={`Search ${page.title.toLowerCase()}...`}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
            {["All severities", "low", "medium", "high", "critical"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
            {["All statuses", ...Array.from(new Set(items.map((item) => item.status)))].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            onClick={() => notify("Saved compliance views opened in demo mode.")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Saved views
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading compliance records...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No compliance records found</div>
            <p className="mt-1 text-sm text-slate-500">Adjust filters or create a new compliance workflow.</p>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Record</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Evidence</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-bold text-indigo-600">{item.id}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{item.subject}</div>
                      <div className="text-xs text-slate-500">{item.category}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{item.owner}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{item.due}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{item.evidence}</td>
                    <td className="px-5 py-3.5"><Badge tone={severityTone[item.severity]} dot>{item.severity}</Badge></td>
                    <td className="px-5 py-3.5"><Badge tone={statusTone(item.status)} dot>{item.status}</Badge></td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Review
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
        <ComplianceDrawer
          record={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
          onNotify={notify}
          onAdvance={() => advanceWorkflow(selected)}
        />
      )}

      {showForm && <ComplianceForm title={page.createLabel} onClose={() => setShowForm(false)} onSubmit={createRecord} />}
    </div>
  );
};

type FormState = {
  subject: string;
  category: string;
  owner: string;
  severity: Severity;
  due: string;
  summary: string;
  action: string;
};

const ComplianceForm: React.FC<{
  title: string;
  onClose: () => void;
  onSubmit: (form: FormState) => void;
}> = ({ title, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>({
    subject: "",
    category: "Compliance",
    owner: "",
    severity: "medium",
    due: "This week",
    summary: "",
    action: "",
  });
  const [error, setError] = useState<string | null>(null);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-900/30">
      <button className="flex-1 cursor-default" aria-label="Close form" onClick={onClose} />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Compliance workflow</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.subject.trim() || !form.owner.trim() || !form.action.trim()) {
              setError("Subject, owner and corrective action are required.");
              return;
            }
            onSubmit(form);
          }}
        >
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div>}
          <Field label="Subject" value={form.subject} onChange={(value) => update("subject", value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={form.category} onChange={(value) => update("category", value)} />
            <Field label="Owner" value={form.owner} onChange={(value) => update("owner", value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="text-xs font-semibold text-slate-700">Severity</span>
              <select value={form.severity} onChange={(event) => update("severity", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {["low", "medium", "high", "critical"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <Field label="Due" value={form.due} onChange={(value) => update("due", value)} />
          </div>
          <Field label="Corrective action" value={form.action} onChange={(value) => update("action", value)} />
          <label>
            <span className="text-xs font-semibold text-slate-700">Summary</span>
            <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} rows={5} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Create workflow</button>
          </div>
        </form>
      </aside>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label>
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
  </label>
);

const ComplianceDrawer: React.FC<{
  record: ComplianceRecord;
  canManage: boolean;
  onClose: () => void;
  onNotify: (message: string) => void;
  onAdvance: () => void;
}> = ({ record, canManage, onClose, onNotify, onAdvance }) => (
  <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/30">
    <button className="flex-1 cursor-default" aria-label="Close details" onClick={onClose} />
    <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{record.category}</div>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">{record.subject}</h2>
          <p className="mt-1 font-mono text-xs font-bold text-slate-500">{record.id}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone={severityTone[record.severity]} dot>{record.severity}</Badge>
          <Badge tone={statusTone(record.status)} dot>{record.status}</Badge>
          <Badge tone="indigo">{record.evidence}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{record.summary}</p>

        <Card title="Status workflow" description="Current workflow gates for this record.">
          <div className="grid gap-3 md:grid-cols-4">
            {record.workflow.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">{index + 1}</span>
                <div className="mt-2 text-sm font-semibold text-slate-900">{step}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Investigation timeline" description="Evidence-backed timeline of investigation activity.">
          <ol className="space-y-4">
            {record.timeline.map((event) => (
              <li key={`${event.when}-${event.title}`} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <div>
                  <div className="text-xs font-bold text-slate-400">{event.when}</div>
                  <div className="text-sm font-semibold text-slate-900">{event.title}</div>
                  <p className="text-xs text-slate-500">{event.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Corrective actions" description="CAPA workflow with owners and due dates.">
          <div className="divide-y divide-slate-100">
            {record.actions.map((action) => (
              <div key={action.task} className="grid gap-3 py-3 first:pt-0 last:pb-0 md:grid-cols-[1fr_120px_100px_110px]">
                <div className="text-sm font-semibold text-slate-900">{action.task}</div>
                <div className="text-xs text-slate-500">{action.owner}</div>
                <div className="text-xs text-slate-500">{action.due}</div>
                <Badge tone={statusTone(action.status)}>{action.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Audit trail" description="Immutable-style activity log for evidence review.">
          <div className="space-y-3">
            {record.audit.map((event) => (
              <div key={`${event.when}-${event.event}`} className="rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-400">{event.when}</span>
                  <span className="text-xs font-semibold text-slate-600">{event.actor}</span>
                </div>
                <div className="mt-1 text-sm text-slate-800">{event.event}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNotify(`${record.id} evidence exported.`)} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export evidence
          </button>
          <button onClick={() => onNotify(`${record.id} audit trail exported.`)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Export audit trail
          </button>
          {canManage && (
            <button onClick={onAdvance} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              Advance workflow
            </button>
          )}
        </div>
      </div>
    </aside>
  </div>
);

export const ComplianceOverviewPage = () => <ComplianceSystemPage pageKey="overview" />;
export const ComplianceEventsPage = () => <ComplianceSystemPage pageKey="events" />;
export const RiskAlertsPage = () => <ComplianceSystemPage pageKey="risk-alerts" />;
export const StaffCredentialsPage = () => <ComplianceSystemPage pageKey="credentials" />;
export const TrainingRecordsPage = () => <ComplianceSystemPage pageKey="training" />;
export const ExpiryTrackingPage = () => <ComplianceSystemPage pageKey="expiry" />;
export const IncidentRegisterPage = () => <ComplianceSystemPage pageKey="incidents" />;
export const InvestigationsPage = () => <ComplianceSystemPage pageKey="investigations" />;
export const AuditLogsPage = () => <ComplianceSystemPage pageKey="audit-logs" />;
export const PolicyTrackingPage = () => <ComplianceSystemPage pageKey="policies" />;
export const CorrectiveActionsPage = () => <ComplianceSystemPage pageKey="corrective-actions" />;
