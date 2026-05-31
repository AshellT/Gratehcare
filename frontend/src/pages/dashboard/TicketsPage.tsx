import React, { useEffect, useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { ticketsApi } from "@/lib/api/tickets";
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await ticketsApi.list({ limit: 50 });
        if (!mounted) return;
        setTickets((res.data ?? []) as unknown as RawTicket[]);
      } catch {
        if (mounted) toast.error("Failed to load tickets", "Could not fetch support queue.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Tickets"
        description="Tenant support queue, routing and resolution metrics."
        actions={[{ label: "New ticket", icon: <Plus className="h-4 w-4" /> }]}
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
    </div>
  );
};

export default TicketsPage;
