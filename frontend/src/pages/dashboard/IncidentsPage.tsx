import React from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

type Severity = "high" | "medium" | "low";
type Status = "open" | "investigating" | "review" | "resolved";

const incidents: {
  id: string;
  type: string;
  client: string;
  reporter: string;
  severity: Severity;
  status: Status;
  time: string;
}[] = [
  { id: "INC-481", type: "Slip & fall", client: "Marcus Thompson", reporter: "Daniel Wu", severity: "high", status: "investigating", time: "3h ago" },
  { id: "INC-480", type: "Medication error", client: "Eleanor Rivers", reporter: "Priya Raman", severity: "medium", status: "review", time: "Yesterday" },
  { id: "INC-479", type: "Property damage", client: "—", reporter: "Office", severity: "low", status: "open", time: "2 days ago" },
  { id: "INC-478", type: "Behaviour incident", client: "Henry Park", reporter: "Sara Hill", severity: "medium", status: "resolved", time: "5 days ago" },
  { id: "INC-477", type: "Near miss", client: "Alana Williams", reporter: "James McGuire", severity: "low", status: "resolved", time: "1 week ago" },
];

const severityTone: Record<Severity, any> = {
  high: "rose",
  medium: "amber",
  low: "slate",
};
const statusTone: Record<Status, any> = {
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

const IncidentsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Incidents"
        description="Log, triage and close out incidents — with audit-ready records."
        actions={[{ label: "Report incident", icon: <Plus className="h-4 w-4" /> }]}
      />

      <div className="grid lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const items = incidents.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              className={`rounded-2xl border border-slate-200 bg-white border-t-4 ${col.tone}`}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-900">{col.label}</div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {items.map((it) => (
                  <div
                    key={it.id}
                    data-testid={`incident-${it.id}`}
                    className="rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono font-bold text-slate-500">{it.id}</div>
                      <Badge tone={severityTone[it.severity]} dot>
                        {it.severity}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{it.type}</div>
                    <div className="text-xs text-slate-500 mt-1">{it.client}</div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                      <span>by {it.reporter}</span>
                      <span>{it.time}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-xs text-slate-400 text-center py-8">
                    No incidents
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentsPage;
