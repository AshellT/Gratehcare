import React from "react";
import { Plus, Download, Filter, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { Receipt, Wallet, Activity, AlertTriangle } from "lucide-react";

const invoices = [
  { id: "INV-3421", client: "Eleanor Rivers", amount: "$1,240", date: "Dec 02", due: "Dec 16", status: "paid" },
  { id: "INV-3420", client: "Marcus Thompson", amount: "$2,180", date: "Dec 02", due: "Dec 16", status: "pending" },
  { id: "INV-3419", client: "Alana Williams", amount: "$840", date: "Nov 28", due: "Dec 12", status: "overdue" },
  { id: "INV-3418", client: "Henry Park", amount: "$1,560", date: "Nov 28", due: "Dec 12", status: "paid" },
  { id: "INV-3417", client: "Maya Krishnan", amount: "$420", date: "Nov 25", due: "Dec 09", status: "paid" },
  { id: "INV-3416", client: "Olivier Chen", amount: "$960", date: "Nov 25", due: "Dec 09", status: "pending" },
  { id: "INV-3415", client: "Ben Whitaker", amount: "$680", date: "Nov 21", due: "Dec 05", status: "paid" },
];

const statusTone: Record<string, any> = {
  paid: "emerald",
  pending: "amber",
  overdue: "rose",
};

const BillingPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Billing"
        description="Invoices, payments and reconciliation in one place."
        actions={[
          { label: "Export", variant: "secondary", icon: <Download className="h-4 w-4" /> },
          { label: "New invoice", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Outstanding" value="$28,420" tone="amber" icon={<Receipt className="h-5 w-5" />} index={0} />
        <StatCard label="Paid this month" value="$142,180" tone="emerald" icon={<Wallet className="h-5 w-5" />} delta={{ value: "+12%", direction: "up" }} index={1} />
        <StatCard label="Avg. days to pay" value="11d" tone="indigo" icon={<Activity className="h-5 w-5" />} delta={{ value: "-3d", direction: "up" }} index={2} />
        <StatCard label="Overdue" value="3" tone="rose" icon={<AlertTriangle className="h-5 w-5" />} index={3} />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-display font-bold text-slate-900">Invoices</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{invoices.length} this month</span>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Issued</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  data-testid={`invoice-row-${inv.id}`}
                  className="border-b border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-slate-900">{inv.id}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{inv.client}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{inv.date}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{inv.due}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{inv.amount}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone[inv.status]} dot>
                      {inv.status}
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

export default BillingPage;
