import React from "react";
import { Download, FileBadge, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

const audits = [
  { name: "NDIS Quality & Safeguards", date: "Mar 14, 2026", status: "scheduled", coverage: 94 },
  { name: "Internal Q3 audit", date: "Sep 22, 2025", status: "passed", coverage: 96 },
  { name: "Annual financial audit", date: "Jul 02, 2025", status: "passed", coverage: 100 },
  { name: "Care plan review", date: "May 18, 2025", status: "passed", coverage: 92 },
];

const checklist = [
  { item: "Police checks current", status: "ok", evidence: "Auto-tracked" },
  { item: "First aid certifications current", status: "warn", evidence: "1 expiring" },
  { item: "Care plans reviewed in last 90 days", status: "ok", evidence: "184/184" },
  { item: "Incident reports closed within SLA", status: "ok", evidence: "97% on time" },
  { item: "Service agreements signed", status: "ok", evidence: "Auto-tracked" },
  { item: "Vehicle insurance current", status: "warn", evidence: "1 expiring" },
];

const AuditsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Audits"
        description="Past and upcoming audits, with one-click evidence exports."
        actions={[{ label: "Export audit pack", icon: <Download className="h-4 w-4" /> }]}
      />

      <Card title="Audit-readiness checklist" description="Live evidence across your organisation" icon={<ShieldCheck className="h-4 w-4" />}>
        <ul className="grid sm:grid-cols-2 gap-3">
          {checklist.map((c) => (
            <li
              key={c.item}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  c.status === "ok"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {c.status === "ok" ? "✓" : "!"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{c.item}</div>
                <div className="text-xs text-slate-500">{c.evidence}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Audit history" icon={<FileBadge className="h-4 w-4" />}>
        <ul className="divide-y divide-slate-100">
          {audits.map((a) => (
            <li key={a.name} className="flex items-center justify-between py-4 first:pt-0">
              <div>
                <div className="text-sm font-semibold text-slate-900">{a.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{a.date}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Coverage</div>
                  <div className="text-sm font-bold text-slate-900">{a.coverage}%</div>
                </div>
                <Badge tone={a.status === "passed" ? "emerald" : "indigo"} dot>
                  {a.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default AuditsPage;
