import React from "react";
import { Plus, Download } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { ShieldCheck, AlertTriangle, FileBadge, Users } from "lucide-react";

const credentials = [
  { staff: "Priya Raman", type: "Police check", expires: "12 days", status: "soon" },
  { staff: "James McGuire", type: "First aid certificate", expires: "4 days", status: "critical" },
  { staff: "Daniel Wu", type: "Vehicle insurance", expires: "21 days", status: "soon" },
  { staff: "Sara Hill", type: "NDIS clearance", expires: "28 days", status: "soon" },
  { staff: "Tom Reed", type: "WWCC", expires: "62 days", status: "ok" },
  { staff: "Maya Khan", type: "Driver's licence", expires: "98 days", status: "ok" },
  { staff: "Olivia Park", type: "First aid certificate", expires: "112 days", status: "ok" },
];

const tone = (s: string) =>
  s === "critical" ? "rose" : s === "soon" ? "amber" : "emerald";

const CompliancePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="Credentials & compliance"
        description="Live credential dashboards, auto-expiry reminders and audit-ready exports."
        actions={[
          { label: "Export audit trail", variant: "secondary", icon: <Download className="h-4 w-4" /> },
          { label: "Add credential", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Compliance score" value="96%" tone="emerald" icon={<ShieldCheck className="h-5 w-5" />} index={0} />
        <StatCard label="Expiring < 30d" value="8" tone="amber" icon={<AlertTriangle className="h-5 w-5" />} index={1} />
        <StatCard label="Audit-ready" value="Yes" tone="indigo" icon={<FileBadge className="h-5 w-5" />} index={2} />
        <StatCard label="Active staff" value="124" tone="sky" icon={<Users className="h-5 w-5" />} index={3} />
      </div>

      <Card title="Credentials" description="Sorted by soonest expiry">
        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Staff member</th>
                <th className="px-5 py-3">Credential</th>
                <th className="px-5 py-3">Expires in</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {credentials.map((c) => (
                <tr key={c.staff + c.type} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {c.staff
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{c.staff}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{c.type}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.expires}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={tone(c.status) as any} dot>
                      {c.status === "critical" ? "Critical" : c.status === "soon" ? "Renew soon" : "Valid"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                      Send reminder
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

export default CompliancePage;
