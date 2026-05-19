import React, { useState } from "react";
import { Plus, Download, Filter } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

type ClaimStage = "submitted" | "review" | "approved" | "paid" | "rejected";

const claims: {
  id: string;
  client: string;
  amount: string;
  insurer: string;
  date: string;
  stage: ClaimStage;
}[] = [
  { id: "CL-2189", client: "Eleanor Rivers", amount: "$1,420", insurer: "NDIS", date: "Dec 02", stage: "approved" },
  { id: "CL-2188", client: "Marcus Thompson", amount: "$840", insurer: "Allianz", date: "Dec 02", stage: "review" },
  { id: "CL-2187", client: "Alana Williams", amount: "$2,160", insurer: "NDIS", date: "Nov 30", stage: "paid" },
  { id: "CL-2186", client: "Henry Park", amount: "$1,180", insurer: "Bupa", date: "Nov 28", stage: "submitted" },
  { id: "CL-2185", client: "Olivier Chen", amount: "$960", insurer: "Aged Care", date: "Nov 26", stage: "paid" },
  { id: "CL-2184", client: "Maya Krishnan", amount: "$580", insurer: "NDIS", date: "Nov 24", stage: "rejected" },
];

const stageTone: Record<ClaimStage, any> = {
  submitted: "indigo",
  review: "amber",
  approved: "emerald",
  paid: "sky",
  rejected: "rose",
};

const stages: { key: ClaimStage; label: string; count: number; value: string }[] = [
  { key: "submitted", label: "Submitted", count: 24, value: "$48,200" },
  { key: "review", label: "In review", count: 12, value: "$22,640" },
  { key: "approved", label: "Approved", count: 38, value: "$84,180" },
  { key: "paid", label: "Paid", count: 142, value: "$312,420" },
];

const ClaimsPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Claims"
        description="Track every claim from submission to deposit."
        actions={[
          { label: "Export", variant: "secondary", icon: <Download className="h-4 w-4" /> },
          { label: "New claim", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((s) => (
          <div key={s.key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-bold text-slate-900">{s.count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.value}</div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  s.key === "submitted"
                    ? "bg-indigo-500"
                    : s.key === "review"
                      ? "bg-amber-500"
                      : s.key === "approved"
                        ? "bg-emerald-500"
                        : "bg-sky-500"
                }`}
                style={{ width: `${20 + s.count}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="text-sm">
            <span className="font-display font-bold text-slate-900">Recent claims</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-slate-500">Last 14 days</span>
          </div>
          <button
            onClick={() => notify("Claim filters opened in demo mode.")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Claim</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Insurer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr
                  key={c.id}
                  data-testid={`claim-row-${c.id}`}
                  className="border-b border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-slate-900">{c.id}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{c.client}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{c.insurer}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{c.amount}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={stageTone[c.stage]} dot>
                      {c.stage}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClaimsPage;
