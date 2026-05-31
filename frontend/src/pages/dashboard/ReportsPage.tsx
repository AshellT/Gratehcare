import React, { useCallback, useEffect, useState } from "react";
import { Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import { TrendingUp, Wallet, Users, Activity } from "lucide-react";
import { useActionQuery } from "@/hooks/useActionQuery";
import { clientsApi } from "@/lib/api/clients";
import { billingApi } from "@/lib/api/billing";
import { staffApi } from "@/lib/api/staff";
import { reportsApi } from "@/lib/api/reports";
import { useToast } from "@/context/ToastContext";

const ReportsPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [clientCount, setClientCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [clients, staff, invoices, reports] = await Promise.all([
          clientsApi.list().catch(() => ({ data: [], total: 0 })),
          staffApi.list().catch(() => ({ data: [], total: 0 })),
          billingApi.listInvoices().catch(() => ({ data: [], total: 0 })),
          reportsApi.list().catch(() => ({ data: [], total: 0 })),
        ]);
        if (!mounted) return;
        setClientCount(clients.total ?? clients.data?.length ?? 0);
        setStaffCount(staff.total ?? staff.data?.length ?? 0);
        setRevenue(
          (invoices.data ?? [])
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + i.amount, 0),
        );
        setReportCount(reports.total ?? reports.data?.length ?? 0);
      } catch {
        if (mounted) toast.error("Failed to load reports", "Could not fetch analytics data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleExport = useCallback(async () => {
    try {
      const report = await reportsApi.generate("operational", {
        title: `Organisation report ${new Date().toISOString().slice(0, 10)}`,
      });
      const payload = await reportsApi.download(report.id);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${report.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
      setReportCount((c) => c + 1);
    } catch {
      toast.error("Export failed", "Could not generate or download report.");
    }
  }, [toast]);

  useActionQuery("export", () => {
    void handleExport();
  });

  const revenueLabel = loading ? "..." : `$${revenue.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Operational, financial and clinical analytics for the whole organisation."
        actions={[
          { label: "Last 90 days", variant: "secondary", icon: <Calendar className="h-4 w-4" /> },
          { label: "Export", icon: <Download className="h-4 w-4" />, onClick: () => void handleExport() },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Paid revenue" value={revenueLabel} tone="emerald" icon={<Wallet className="h-5 w-5" />} index={0} />
        <StatCard label="Active clients" value={loading ? "..." : String(clientCount)} tone="indigo" icon={<Users className="h-5 w-5" />} index={1} />
        <StatCard label="Staff members" value={loading ? "..." : String(staffCount)} tone="sky" icon={<Activity className="h-5 w-5" />} index={2} />
        <StatCard label="Saved reports" value={loading ? "..." : String(reportCount)} tone="amber" icon={<TrendingUp className="h-5 w-5" />} index={3} />
      </div>

      <Card title="Analytics" description="Charts populate when billing and visit data is available.">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading report data...</div>
        ) : clientCount === 0 && revenue === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No analytics data yet</div>
            <p className="mt-1 text-sm text-slate-500">
              Add clients, staff, and invoices to see operational and financial reports.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <MiniBarChart
              title="Clients & staff"
              data={[
                { label: "Clients", value: clientCount, tone: "indigo" },
                { label: "Staff", value: staffCount, tone: "sky" },
              ]}
            />
            <MiniBarChart
              title="Reports generated"
              data={[{ label: "Reports", value: reportCount, tone: "emerald" }]}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

const MiniBarChart: React.FC<{
  title: string;
  data: { label: string; value: number; tone: string }[];
}> = ({ title, data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const tones: Record<string, string> = {
    indigo: "bg-indigo-500",
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
  };
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900 mb-3">{title}</div>
      <ul className="space-y-3">
        {data.map((d, i) => (
          <li key={d.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">{d.label}</span>
              <span className="font-semibold text-slate-900">{d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className={`h-full rounded-full ${tones[d.tone]}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsPage;
