import React from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { Building2, Users, Wallet, TrendingUp } from "lucide-react";

const tenants = [
  { name: "Meridian Home Care", plan: "Enterprise", staff: 184, mrr: "$4,820", health: "healthy", region: "AU" },
  { name: "Aurora Disability", plan: "Growth", staff: 142, mrr: "$3,640", health: "healthy", region: "AU" },
  { name: "Northwind Care", plan: "Growth", staff: 98, mrr: "$2,420", health: "watch", region: "NZ" },
  { name: "Brightpath", plan: "Growth", staff: 76, mrr: "$1,920", health: "healthy", region: "AU" },
  { name: "Caretide Co", plan: "Starter", staff: 24, mrr: "$680", health: "watch", region: "UK" },
  { name: "Havenwell", plan: "Starter", staff: 18, mrr: "$520", health: "at-risk", region: "US" },
];

const TenantsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Tenants"
        description="Every organisation running on Lumina."
        actions={[{ label: "Add tenant", icon: <Plus className="h-4 w-4" /> }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total tenants" value="1,284" tone="indigo" icon={<Building2 className="h-5 w-5" />} delta={{ value: "+42", direction: "up" }} index={0} />
        <StatCard label="Active users" value="18,420" tone="sky" icon={<Users className="h-5 w-5" />} index={1} />
        <StatCard label="Combined MRR" value="$284,910" tone="emerald" icon={<Wallet className="h-5 w-5" />} delta={{ value: "+12%", direction: "up" }} index={2} />
        <StatCard label="NRR" value="118%" tone="amber" icon={<TrendingUp className="h-5 w-5" />} index={3} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search tenants..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Organisation</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">MRR</th>
                <th className="px-5 py-3">Region</th>
                <th className="px-5 py-3">Health</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.name} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-xs font-bold flex items-center justify-center">
                        {t.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500">tenant_{t.name.toLowerCase().replace(/\s+/g, "_").slice(0, 14)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={t.plan === "Enterprise" ? "violet" : t.plan === "Growth" ? "indigo" : "slate"}>
                      {t.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{t.staff}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{t.mrr}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{t.region}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={t.health === "healthy" ? "emerald" : t.health === "watch" ? "amber" : "rose"} dot>
                      {t.health}
                    </Badge>
                  </td>
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

export default TenantsPage;
