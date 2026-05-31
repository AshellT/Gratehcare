import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  HeartPulse,
  MessageSquare,
  Plus,
  Receipt,
  Search,
  Send,
  Stethoscope,
  Users,
  Wallet,
  X,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { clientsApi } from "@/lib/api/clients";
import { careApi } from "@/lib/api/care";
import { documentsApi } from "@/lib/api/documents";
import { billingApi } from "@/lib/api/billing";
import { rosteringApi } from "@/lib/api/rostering";
import { reportsApi } from "@/lib/api/reports";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import { useActionQuery } from "@/hooks/useActionQuery";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { useToast } from "@/context/ToastContext";

type Tone = "emerald" | "amber" | "rose" | "indigo" | "sky" | "slate" | "violet";
type FamilyPageKind =
  | "overview"
  | "visit-history"
  | "shared-care-notes"
  | "upcoming-visits"
  | "shared-documents"
  | "invoices"
  | "payments"
  | "messages";
type PractitionerPageKind =
  | "overview"
  | "assigned-clients"
  | "care-plans"
  | "clinical-notes"
  | "reports"
  | "evaluations"
  | "messages";

type PortalRecord = {
  id: string;
  title: string;
  subtitle: string;
  person: string;
  date: string;
  status: string;
  category: string;
  detail: string;
  amount?: string;
  sharedBy?: string;
};


async function loadPortalRecords(practitioner: boolean): Promise<PortalRecord[]> {
  const [clients, notes, plans, documents, invoices, shifts] = await Promise.all([
    clientsApi.list().catch(() => ({ data: [] })),
    careApi.listNotes().catch(() => ({ data: [] })),
    careApi.listPlans().catch(() => ({ data: [] })),
    documentsApi.list().catch(() => ({ data: [] })),
    billingApi.listInvoices().catch(() => ({ data: [] })),
    rosteringApi.listShifts().catch(() => ({ data: [] })),
  ]);

  const rows: PortalRecord[] = [];

  for (const client of clients.data ?? []) {
    rows.push({
      id: client.id,
      title: client.fullName,
      subtitle: client.funding,
      person: client.fullName,
      date: client.since,
      status: client.status,
      category: practitioner ? "Assigned client" : "Overview",
      detail: `Client since ${client.since}. Funding: ${client.funding}.`,
      sharedBy: client.coordinator ?? "Care team",
    });
  }

  for (const note of notes.data ?? []) {
    rows.push({
      id: note.id,
      title: note.content.slice(0, 60),
      subtitle: `Visit ${note.visitDate}`,
      person: note.clientName,
      date: note.visitDate,
      status: note.flagged ? "review" : "shared",
      category: practitioner ? "Clinical note" : "Care note",
      detail: note.content,
      sharedBy: note.workerName,
    });
  }

  for (const plan of plans.data ?? []) {
    rows.push({
      id: plan.id,
      title: `${plan.clientName} care plan`,
      subtitle: plan.status.replace(/_/g, " "),
      person: plan.clientName,
      date: plan.nextReviewAt ?? plan.lastReviewedAt ?? "—",
      status: plan.status === "review_due" ? "review" : "active",
      category: "Care plan",
      detail: `Goals: ${plan.goals.join(", ")}`,
      sharedBy: plan.coordinator,
    });
  }

  for (const doc of documents.data ?? []) {
    rows.push({
      id: doc.id,
      title: doc.name,
      subtitle: doc.mimeType,
      person: "—",
      date: doc.createdAt ?? "—",
      status: "available",
      category: "Document",
      detail: `Uploaded by ${doc.uploadedBy}`,
      sharedBy: doc.uploadedBy,
    });
  }

  for (const inv of invoices.data ?? []) {
    rows.push({
      id: inv.invoiceNumber || inv.id,
      title: `Invoice ${inv.invoiceNumber}`,
      subtitle: inv.clientName,
      person: inv.clientName,
      date: inv.issuedAt,
      status: inv.status === "paid" ? "paid" : "sent",
      category: inv.status === "paid" ? "Payment" : "Invoice",
      detail: `Amount ${inv.amount}`,
      amount: `${inv.amount.toLocaleString()}`,
      sharedBy: "Finance",
    });
  }

  for (const shift of shifts.data ?? []) {
    rows.push({
      id: shift.id,
      title: `${shift.clientName} · ${shift.type}`,
      subtitle: shift.workerName ? `With ${shift.workerName}` : "Unassigned",
      person: shift.clientName,
      date: new Date(shift.startTime).toLocaleString("en-AU", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status:
        shift.status === "open"
          ? "scheduled"
          : shift.status === "completed"
            ? "completed"
            : "active",
      category: "Visit",
      detail: `Location: ${shift.location ?? "—"}`,
      sharedBy: shift.workerName ?? "Rostering",
    });
  }

  return rows;
}

const statusTone = (status: string): Tone => {
  if (["completed", "paid", "received", "available", "active", "ready", "shared"].includes(status)) return "emerald";
  if (["scheduled", "review", "draft"].includes(status)) return "amber";
  if (["unread", "overdue"].includes(status)) return "rose";
  return "indigo";
};

const familyMeta: Record<FamilyPageKind, { title: string; description: string; category?: string; icon: React.ReactNode }> = {
  overview: { title: "Family Overview", description: "A simple view of care, visits, updates, documents, and billing shared with you.", icon: <HeartPulse className="h-5 w-5" /> },
  "visit-history": { title: "Visit History", description: "Past visits and completed care updates.", category: "Visit", icon: <CalendarCheck className="h-5 w-5" /> },
  "shared-care-notes": { title: "Shared Care Notes", description: "Care notes your care team has shared with the family portal.", category: "Care note", icon: <FileText className="h-5 w-5" /> },
  "upcoming-visits": { title: "Upcoming Visits", description: "Scheduled visits and appointments you can plan around.", category: "Visit", icon: <CalendarCheck className="h-5 w-5" /> },
  "shared-documents": { title: "Shared Documents", description: "Care plans, agreements, reports, and other shared documents.", category: "Document", icon: <FileText className="h-5 w-5" /> },
  invoices: { title: "Invoices", description: "Invoices shared with you by the finance team.", category: "Invoice", icon: <Receipt className="h-5 w-5" /> },
  payments: { title: "Payments", description: "Payment receipts and matched payments.", category: "Payment", icon: <Wallet className="h-5 w-5" /> },
  messages: { title: "Messages", description: "Simple messages with the care team.", category: "Message", icon: <MessageSquare className="h-5 w-5" /> },
};

const practitionerMeta: Record<PractitionerPageKind, { title: string; description: string; category?: string; create?: string; icon: React.ReactNode }> = {
  overview: { title: "Practitioner Overview", description: "Your clinical workload, upcoming reviews, messages, and shared care context.", icon: <Stethoscope className="h-5 w-5" /> },
  "assigned-clients": { title: "Assigned Clients", description: "Clients assigned to you for review, planning, reporting, or evaluation.", category: "Assigned client", icon: <Users className="h-5 w-5" /> },
  "care-plans": { title: "Care Plans", description: "Care plans needing clinical input or review.", category: "Care plan", icon: <HeartPulse className="h-5 w-5" /> },
  "clinical-notes": { title: "Clinical Notes", description: "Create and review clinical notes shared with the care team.", category: "Clinical note", create: "New clinical note", icon: <FileText className="h-5 w-5" /> },
  reports: { title: "Reports", description: "Clinical reports and family-shareable progress summaries.", category: "Report", create: "New report", icon: <FileText className="h-5 w-5" /> },
  evaluations: { title: "Evaluations", description: "Functional, wellbeing, risk, and goal evaluations.", category: "Evaluation", create: "New evaluation", icon: <CheckCircle2 className="h-5 w-5" /> },
  messages: { title: "Messages", description: "Clinical coordination messages with care teams.", category: "Message", icon: <MessageSquare className="h-5 w-5" /> },
};

const filterRecords = (records: PortalRecord[], category?: string, kind?: string) => {
  if (!category) return records;
  const items = records.filter((record) => record.category === category);
  if (kind === "upcoming-visits") return items.filter((record) => record.status === "scheduled");
  if (kind === "visit-history") return items.filter((record) => record.status !== "scheduled");
  return items;
};

const FamilyPortalPage: React.FC<{ kind: FamilyPageKind }> = ({ kind }) => {
  const page = familyMeta[kind];
  return (
    <PortalShell
      pageTitle={page.title}
      eyebrow="Family portal"
      description={page.description}
      portalKind={kind}
      portalCategory={page.category}
      icon={page.icon}
      readOnly
      allowMessage={kind === "messages"}
    />
  );
};

const PractitionerPortalPage: React.FC<{ kind: PractitionerPageKind }> = ({ kind }) => {
  const page = practitionerMeta[kind];
  return (
    <PortalShell
      pageTitle={page.title}
      eyebrow="Practitioner portal"
      description={page.description}
      portalKind={kind}
      portalCategory={page.category}
      icon={page.icon}
      createLabel={page.create}
      canCreate={Boolean(page.create)}
      practitioner
      allowMessage={kind === "messages"}
    />
  );
};

const PortalShell: React.FC<{
  pageTitle: string;
  eyebrow: string;
  description: string;
  portalKind?: string;
  portalCategory?: string;
  icon: React.ReactNode;
  readOnly?: boolean;
  practitioner?: boolean;
  canCreate?: boolean;
  createLabel?: string;
  allowMessage?: boolean;
}> = ({ pageTitle, eyebrow, description, portalKind, portalCategory, icon, readOnly, practitioner, canCreate, createLabel, allowMessage }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<PortalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const records = await loadPortalRecords(Boolean(practitioner));
    setItems(filterRecords(records, portalCategory, portalKind));
  }, [practitioner, portalCategory, portalKind]);

  useEffect(() => {
    let mounted = true;
    reload()
      .then(() => {
        if (mounted) setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [reload]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<PortalRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data: convData } = useConversations();
  const messageThreadId = convData?.data?.[0]?.id ?? null;
  const { send: sendPortalMessage } = useMessages(
    allowMessage ? messageThreadId : null,
  );

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const text = `${item.id} ${item.title} ${item.subtitle} ${item.person} ${item.category}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (status === "All statuses" || item.status === status);
      }),
    [items, query, status],
  );

  useActionQuery("create", () => {
    if (canCreate) setShowForm(true);
  });

  const createRecord = async (form: PortalFormState) => {
    try {
      if (portalKind === "clinical-notes") {
        await careApi.createNote(
          toTenantRecord(form.title, form.detail, {
            clientName: form.person,
            workerName: user?.name,
          }) as any,
        );
      } else if (portalKind === "reports") {
        await reportsApi.generate("clinical", {
          title: form.title,
          metadata: JSON.stringify({ detail: form.detail, person: form.person }),
        });
      } else if (portalKind === "evaluations") {
        await careApi.createPlan(
          toTenantRecord(`${form.person} evaluation`, form.detail, {
            goals: [form.title],
          }) as any,
        );
      } else {
        toast.warning("Create not supported", "This portal view is read-only.");
        return;
      }
      await reload();
      setShowForm(false);
      notify(`${form.category} created.`);
    } catch {
      toast.error("Create failed", "Could not save portal record.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={pageTitle}
        description={description}
        actions={[
          { label: "Export", variant: "secondary", icon: <Download className="h-4 w-4" />, onClick: () => notify(`${pageTitle} exported.`) },
          ...(canCreate ? [{ label: createLabel || "Create", icon: <Plus className="h-4 w-4" />, onClick: () => setShowForm(true) }] : []),
        ]}
      />

      {message && <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">{message}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Shared items" value={`${items.length}`} tone="indigo" icon={icon} index={0} />
        <StatCard label={practitioner ? "Active clients" : "Upcoming"} value={`${items.filter((item) => ["scheduled", "active", "review"].includes(item.status)).length}`} tone="sky" icon={<CalendarCheck className="h-5 w-5" />} index={1} />
        <StatCard label={readOnly ? "Read-only" : "Can create"} value={readOnly ? "Yes" : canCreate ? "Yes" : "View"} tone={readOnly ? "slate" : "emerald"} icon={<CheckCircle2 className="h-5 w-5" />} index={2} />
        <StatCard label="Unread" value={`${items.filter((item) => item.status === "unread").length}`} tone="rose" icon={<MessageSquare className="h-5 w-5" />} index={3} />
      </div>

      {allowMessage && (
        <Card title="Quick message" description={readOnly ? "Send a simple message to the care team." : "Send a coordination message."}>
          <MessageComposer
            onSend={async (text) => {
              if (!messageThreadId) {
                toast.warning(
                  "No conversation",
                  "No message thread is available yet.",
                );
                return;
              }
              try {
                await sendPortalMessage(text);
                notify("Message sent to the care team.");
              } catch {
                toast.error("Send failed", "Could not deliver your message.");
              }
            }}
          />
        </Card>
      )}

      <Card
        title={pageTitle}
        description={`${filtered.length} records shown`}
        action={
          <button
            onClick={() => {
              setQuery("");
              setStatus("All statuses");
              notify("Filters reset.");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" />
            Reset
          </button>
        }
      >
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, date, document, or message" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
            {["All statuses", ...Array.from(new Set(items.map((item) => item.status)))].map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading portal records...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">Nothing to show yet</div>
            <p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Person</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-xs font-bold text-indigo-600">{item.id}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.subtitle}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{item.person}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{item.date}</td>
                    <td className="px-5 py-3.5"><Badge tone={statusTone(item.status)} dot>{item.status}</Badge></td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        View
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

      {selected && <PortalDrawer record={selected} readOnly={readOnly} canEdit={Boolean(canCreate)} onClose={() => setSelected(null)} onNotify={notify} />}
      {showForm && <PortalForm title={createLabel || "Create"} onClose={() => setShowForm(false)} onSubmit={createRecord} />}
    </div>
  );
};

const MessageComposer: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
      className="flex gap-2"
    >
      <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Type a short message..." className="h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" />
      <button className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
        <Send className="h-4 w-4" />
        Send
      </button>
    </form>
  );
};

type PortalFormState = {
  title: string;
  subtitle: string;
  person: string;
  category: string;
  detail: string;
};

const PortalForm: React.FC<{ title: string; onClose: () => void; onSubmit: (form: PortalFormState) => void }> = ({ title, onClose, onSubmit }) => {
  const [form, setForm] = useState<PortalFormState>({ title: "", subtitle: "", person: "", category: title.includes("report") ? "Report" : title.includes("evaluation") ? "Evaluation" : "Clinical note", detail: "" });
  const [error, setError] = useState<string | null>(null);
  const update = (key: keyof PortalFormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-900/30">
      <button className="flex-1 cursor-default" aria-label="Close form" onClick={onClose} />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Practitioner portal</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <form
          className="space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.title.trim() || !form.person.trim() || !form.detail.trim()) {
              setError("Title, client, and note details are required.");
              return;
            }
            onSubmit(form);
          }}
        >
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</div>}
          <Field label="Title" value={form.title} onChange={(value) => update("title", value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Client" value={form.person} onChange={(value) => update("person", value)} />
            <Field label="Type" value={form.category} onChange={(value) => update("category", value)} />
          </div>
          <Field label="Short summary" value={form.subtitle} onChange={(value) => update("subtitle", value)} />
          <label>
            <span className="text-xs font-semibold text-slate-700">Details</span>
            <textarea value={form.detail} onChange={(event) => update("detail", event.target.value)} rows={6} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Save</button>
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

const PortalDrawer: React.FC<{ record: PortalRecord; readOnly?: boolean; canEdit?: boolean; onClose: () => void; onNotify: (message: string) => void }> = ({ record, readOnly, canEdit, onClose, onNotify }) => (
  <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/30">
    <button className="flex-1 cursor-default" aria-label="Close details" onClick={onClose} />
    <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{record.category}</div>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">{record.title}</h2>
          <p className="mt-1 font-mono text-xs font-bold text-slate-500">{record.id}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </div>
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone(record.status)} dot>{record.status}</Badge>
          <Badge tone="indigo">{record.person}</Badge>
          {record.amount && <Badge tone="emerald">{record.amount}</Badge>}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{record.detail}</p>
        <Card title="Details">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Date" value={record.date} />
            <Info label="Shared by" value={record.sharedBy || "Care team"} />
            <Info label="Type" value={record.category} />
            <Info label="Summary" value={record.subtitle} />
          </div>
        </Card>
        <Card title={readOnly ? "Shared access" : "Clinical workflow"}>
          <ol className="space-y-3 text-sm text-slate-600">
            {[
              readOnly ? "Shared by your care team" : "Draft saved to clinical workspace",
              readOnly ? "View-only for family portal" : "Available to care team after review",
              "Audit record kept for this item",
            ].map((item) => (
              <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /><span>{item}</span></li>
            ))}
          </ol>
        </Card>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onNotify(`${record.id} downloaded.`)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download</button>
          {canEdit && <button onClick={() => onNotify(`${record.id} opened for editing.`)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Edit</button>}
        </div>
      </div>
    </aside>
  </div>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

export const FamilyOverviewPage = () => <FamilyPortalPage kind="overview" />;
export const FamilyVisitHistoryPage = () => <FamilyPortalPage kind="visit-history" />;
export const FamilySharedCareNotesPage = () => <FamilyPortalPage kind="shared-care-notes" />;
export const FamilyUpcomingVisitsPage = () => <FamilyPortalPage kind="upcoming-visits" />;
export const FamilySharedDocumentsPage = () => <FamilyPortalPage kind="shared-documents" />;
export const FamilyInvoicesPage = () => <FamilyPortalPage kind="invoices" />;
export const FamilyPaymentsPage = () => <FamilyPortalPage kind="payments" />;
export const FamilyMessagesPage = () => <FamilyPortalPage kind="messages" />;

export const PractitionerOverviewPage = () => <PractitionerPortalPage kind="overview" />;
export const PractitionerAssignedClientsPage = () => <PractitionerPortalPage kind="assigned-clients" />;
export const PractitionerCarePlansPage = () => <PractitionerPortalPage kind="care-plans" />;
export const PractitionerClinicalNotesPage = () => <PractitionerPortalPage kind="clinical-notes" />;
export const PractitionerReportsPage = () => <PractitionerPortalPage kind="reports" />;
export const PractitionerEvaluationsPage = () => <PractitionerPortalPage kind="evaluations" />;
export const PractitionerMessagesPage = () => <PractitionerPortalPage kind="messages" />;
