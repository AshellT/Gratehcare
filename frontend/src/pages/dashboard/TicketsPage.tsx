import React from "react";
import { Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

const tickets = [
  { id: "TK-2841", title: "Login failing for Aurora staff", tenant: "Aurora Disability", priority: "P0", status: "open", time: "5m ago", agent: "—" },
  { id: "TK-2840", title: "Claim export missing 2 columns", tenant: "Meridian", priority: "P1", status: "open", time: "22m ago", agent: "Sara" },
  { id: "TK-2839", title: "Schedule sync delayed > 5 min", tenant: "Northwind", priority: "P1", status: "investigating", time: "1h ago", agent: "Tom" },
  { id: "TK-2838", title: "Mobile menu glitch on iOS 17", tenant: "Brightpath", priority: "P3", status: "open", time: "2h ago", agent: "—" },
  { id: "TK-2837", title: "How do I bulk-import clients?", tenant: "Havenwell", priority: "P3", status: "answered", time: "4h ago", agent: "Sara" },
  { id: "TK-2836", title: "Invoice PDF formatting issue", tenant: "Caretide", priority: "P2", status: "resolved", time: "Yesterday", agent: "Tom" },
];

const priorityTone = (p: string) =>
  p === "P0" ? "rose" : p === "P1" ? "amber" : p === "P2" ? "indigo" : "slate";

const statusTone = (s: string) =>
  s === "open" ? "amber" : s === "investigating" ? "indigo" : s === "answered" ? "violet" : "emerald";

const TicketsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Tickets"
        description="Tenant support queue, routing and resolution metrics."
        actions={[{ label: "New ticket", icon: <Plus className="h-4 w-4" /> }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open", value: "32", tone: "bg-amber-50 text-amber-700" },
          { label: "Resolved today", value: "18", tone: "bg-emerald-50 text-emerald-700" },
          { label: "Avg. response", value: "12m", tone: "bg-indigo-50 text-indigo-700" },
          { label: "CSAT (30d)", value: "4.8/5", tone: "bg-sky-50 text-sky-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            <div className={`mt-2 inline-flex font-display text-3xl font-bold rounded-lg px-2.5 py-1 ${s.tone}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Ticket</th>
                <th className="px-5 py-3">Tenant</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Agent</th>
                <th className="px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="text-[10px] font-mono font-bold text-slate-500">{t.id}</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{t.title}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{t.tenant}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={priorityTone(t.priority) as any} dot>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone(t.status) as any} dot>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{t.agent}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{t.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TicketsPage;
