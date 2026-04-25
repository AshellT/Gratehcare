import React, { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

type Client = {
  name: string;
  initial: string;
  status: "active" | "onboarding" | "paused";
  funding: string;
  coordinator: string;
  since: string;
  hours: string;
  color: string;
};

const clients: Client[] = [
  { name: "Eleanor Rivers", initial: "ER", status: "active", funding: "NDIS · Plan-managed", coordinator: "Priya Raman", since: "Jan 2023", hours: "32h/wk", color: "from-indigo-500 to-sky-500" },
  { name: "Marcus Thompson", initial: "MT", status: "active", funding: "Self-funded", coordinator: "Daniel Wu", since: "Mar 2023", hours: "18h/wk", color: "from-rose-500 to-pink-500" },
  { name: "Alana Williams", initial: "AW", status: "active", funding: "Insurance · Allianz", coordinator: "Priya Raman", since: "Jul 2023", hours: "24h/wk", color: "from-emerald-500 to-teal-500" },
  { name: "Henry Park", initial: "HP", status: "active", funding: "NDIS · Self-managed", coordinator: "James Okafor", since: "Sep 2023", hours: "28h/wk", color: "from-amber-500 to-orange-500" },
  { name: "Maya Krishnan", initial: "MK", status: "onboarding", funding: "NDIS · Agency-managed", coordinator: "Sara Hill", since: "Nov 2025", hours: "—", color: "from-fuchsia-500 to-purple-500" },
  { name: "Olivier Chen", initial: "OC", status: "active", funding: "Aged Care Package", coordinator: "Tom Reed", since: "Feb 2024", hours: "16h/wk", color: "from-sky-500 to-cyan-500" },
  { name: "Nadia Hassan", initial: "NH", status: "paused", funding: "NDIS · Plan-managed", coordinator: "Priya Raman", since: "Apr 2024", hours: "0h/wk", color: "from-slate-500 to-slate-700" },
  { name: "Ben Whitaker", initial: "BW", status: "active", funding: "Self-funded", coordinator: "Daniel Wu", since: "Jun 2024", hours: "12h/wk", color: "from-violet-500 to-indigo-500" },
];

const ClientsPage: React.FC = () => {
  const [q, setQ] = useState("");
  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.coordinator.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Clients"
        description="Every client, every plan, every visit — in one place."
        actions={[
          { label: "Filters", variant: "secondary", icon: <Filter className="h-4 w-4" /> },
          { label: "Add client", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active clients", value: "184", tone: "indigo" },
          { label: "Onboarding", value: "12", tone: "amber" },
          { label: "Avg. hours/wk", value: "21h", tone: "sky" },
          { label: "Satisfaction", value: "4.9★", tone: "emerald" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients..."
              data-testid="clients-search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:border-indigo-300 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {clients.length}
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Funding</th>
                <th className="px-5 py-3">Coordinator</th>
                <th className="px-5 py-3">Since</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.name}
                  data-testid={`client-row-${c.initial}`}
                  className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full bg-gradient-to-br ${c.color} text-white text-xs font-bold flex items-center justify-center`}
                      >
                        {c.initial}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">Client #{c.initial.toLowerCase()}-{Math.floor(Math.random() * 9000) + 1000}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      tone={c.status === "active" ? "emerald" : c.status === "onboarding" ? "indigo" : "slate"}
                      dot
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{c.funding}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{c.coordinator}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.since}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{c.hours}</td>
                  <td className="px-5 py-3.5">
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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

export default ClientsPage;
