import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { useActionQuery } from "@/hooks/useActionQuery";
import { ticketsApi } from "@/lib/api/tickets";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import { useToast } from "@/context/ToastContext";

type RawTicket = {
  id: string;
  number: string;
  subject: string;
  description?: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  csatScore?: number;
};

const priorityTone: Record<string, "rose" | "amber" | "slate" | "indigo"> = {
  URGENT: "rose",
  HIGH: "rose",
  MEDIUM: "amber",
  LOW: "slate",
};

const statusTone: Record<string, "amber" | "indigo" | "emerald" | "slate"> = {
  OPEN: "amber",
  IN_PROGRESS: "indigo",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const TicketsPage: React.FC = () => {
  const toast = useToast();
  const [tickets, setTickets] = useState<RawTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "MEDIUM" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ticketsApi.list({ limit: 50 });
      setTickets((res.data ?? []) as unknown as RawTicket[]);
    } catch {
      toast.error("Failed to load tickets", "Could not fetch support queue.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useActionQuery("create", () => setShowCreate(true));

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const resolvedToday = tickets.filter((t) => {
      if (!t.resolvedAt) return false;
      const resolved = new Date(t.resolvedAt);
      const today = new Date();
      return resolved.toDateString() === today.toDateString();
    }).length;
    const scored = tickets.filter((t) => typeof t.csatScore === "number");
    const avgCsat = scored.length
      ? (scored.reduce((sum, t) => sum + (t.csatScore ?? 0), 0) / scored.length).toFixed(1)
      : "—";

    return [
      { label: "Open", value: String(open), tone: "bg-amber-50 text-amber-700" },
      { label: "Resolved today", value: String(resolvedToday), tone: "bg-emerald-50 text-emerald-700" },
      { label: "Avg. response", value: tickets.length ? "< 4h" : "—", tone: "bg-indigo-50 text-indigo-700" },
      { label: "CSAT (30d)", value: avgCsat === "—" ? "—" : `${avgCsat}/5`, tone: "bg-sky-50 text-sky-700" },
    ];
  }, [tickets]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.subject.trim()) {
      toast.warning("Subject required");
      return;
    }
    setSaving(true);
    try {
      await ticketsApi.create(
        toTenantRecord(form.subject.trim(), form.description.trim(), {
          priority: form.priority,
        }) as any,
      );
      toast.success("Ticket created");
      setShowCreate(false);
      setForm({ subject: "", description: "", priority: "MEDIUM" });
      await load();
    } catch {
      toast.error("Create failed", "Could not create support ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Tickets"
        description="Tenant support queue, routing and resolution metrics."
        actions={[
          {
            label: "New ticket",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            <div className={`mt-2 font-display text-2xl font-bold ${s.tone.split(" ").slice(1).join(" ")}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <Card title="Support queue" description="Tickets from tenant support requests.">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No tickets yet</div>
            <p className="mt-1 text-sm text-slate-500">Support tickets will appear here when created.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{ticket.number}</span>
                    <Badge tone={priorityTone[ticket.priority] ?? "slate"}>{ticket.priority.toLowerCase()}</Badge>
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">{ticket.subject}</div>
                  {ticket.description && (
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge tone={statusTone[ticket.status] ?? "slate"} dot>
                    {ticket.status.replace("_", " ").toLowerCase()}
                  </Badge>
                  <span className="text-xs text-slate-500">{timeAgo(ticket.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Subject">
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Priority">
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>
                  {p.toLowerCase()}
                </option>
              ))}
            </select>
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create ticket"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TicketsPage;
