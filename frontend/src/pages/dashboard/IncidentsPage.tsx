import React, { useEffect, useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { incidentsApi } from "@/lib/api/incidents";
import { useToast } from "@/context/ToastContext";

type Severity = "high" | "medium" | "low" | "critical";
type Status = "open" | "investigating" | "review" | "resolved";

type IncidentRow = {
  id: string;
  type: string;
  client: string;
  reporter: string;
  severity: Severity;
  status: Status;
  time: string;
};

type RawIncident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  occurredAt?: string;
  createdAt: string;
  client?: { fullName?: string };
};

const severityTone: Record<Severity, "rose" | "amber" | "slate"> = {
  high: "rose",
  medium: "amber",
  low: "slate",
  critical: "rose",
};

const statusTone: Record<Status, "amber" | "indigo" | "violet" | "emerald"> = {
  open: "amber",
  investigating: "indigo",
  review: "violet",
  resolved: "emerald",
};

const columns: { key: Status; label: string; tone: string }[] = [
  { key: "open", label: "Open", tone: "border-t-amber-500" },
  { key: "investigating", label: "Investigating", tone: "border-t-indigo-500" },
  { key: "review", label: "Review", tone: "border-t-violet-500" },
  { key: "resolved", label: "Resolved", tone: "border-t-emerald-500" },
];

const mapStatus = (status: string): Status => {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "investigating";
    case "REVIEW":
      return "review";
    case "COMPLETED":
    case "APPROVED":
      return "resolved";
    default:
      return "open";
  }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const mapIncident = (raw: RawIncident): IncidentRow => ({
  id: raw.id.slice(0, 8).toUpperCase(),
  type: raw.title,
  client: raw.client?.fullName ?? "—",
  reporter: "—",
  severity: raw.severity.toLowerCase() as Severity,
  status: mapStatus(raw.status),
  time: timeAgo(raw.occurredAt ?? raw.createdAt),
});

const IncidentsPage: React.FC = () => {
  const toast = useToast();
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await incidentsApi.list({ limit: 50 });
        if (!mounted) return;
        setIncidents(((res.data ?? []) as unknown as RawIncident[]).map(mapIncident));
      } catch {
        if (mounted) toast.error("Failed to load incidents", "Could not fetch incidents from backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const grouped = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        items: incidents.filter((i) => i.status === col.key),
      })),
    [incidents],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Incidents"
        description="Log, triage and close out incidents — with audit-ready records."
        actions={[{ label: "Report incident", icon: <Plus className="h-4 w-4" /> }]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading incidents…
        </div>
      ) : incidents.length === 0 ? (
        <Card title="No incidents" description="Incident records from the compliance API.">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No incidents logged yet.
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-4">
          {grouped.map((col) => (
            <div
              key={col.key}
              className={`rounded-2xl border border-slate-200 bg-white border-t-4 ${col.tone}`}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">{col.label}</div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                  {col.items.length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {col.items.map((it) => (
                  <div
                    key={it.id}
                    data-testid={`incident-${it.id}`}
                    className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono font-bold text-slate-500">{it.id}</div>
                      <Badge tone={severityTone[it.severity]} dot>
                        {it.severity}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{it.type}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {it.client} · {it.reporter}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone={statusTone[it.status]}>{it.status}</Badge>
                      <span className="text-[10px] text-slate-400">{it.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
