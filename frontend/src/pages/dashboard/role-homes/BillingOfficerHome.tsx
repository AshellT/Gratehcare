import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import {
  Activity,
  Banknote,
  Download,
  Plus,
  Receipt,
  RefreshCcw,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import RoleGreeting from "./RoleGreeting";

const BillingOfficerHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "Export",
          variant: "secondary",
          icon: <Download className="h-4 w-4" />,
        },
        { label: "New invoice", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Paid revenue", value: loading ?? formatCurrency(data.revenue), tone: "emerald", icon: <Wallet className="h-5 w-5" /> },
        { label: "Open compliance", value: loading ?? String(data.openCompliance), tone: "amber", icon: <ShieldCheck className="h-5 w-5" /> },
        { label: "Clients", value: loading ?? String(data.clients), tone: "indigo", icon: <Receipt className="h-5 w-5" /> },
        { label: "Staff", value: loading ?? String(data.staff), tone: "sky", icon: <Activity className="h-5 w-5" /> },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <TrendCard
        className="lg:col-span-2"
        title="Cash collected"
        description={data.loading ? "Loading..." : data.revenue > 0 ? `${formatCurrency(data.revenue)} paid` : "No billing data yet"}
        data={data.revenue > 0 ? [0, data.revenue * 0.5, data.revenue] : [0, 0]}
        color="#10b981"
      />

      <AlertsWidget
        title="Money on the line"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Claims requiring action"
        items={[]}
      />

      <QuickActions
        actions={[
          {
            label: "Generate invoices",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
          },
          {
            label: "Send reminders",
            icon: <Send className="h-4 w-4" />,
            tone: "amber",
          },
          {
            label: "Submit claims",
            icon: <ShieldCheck className="h-4 w-4" />,
            tone: "emerald",
          },
          {
            label: "Reconcile",
            icon: <RefreshCcw className="h-4 w-4" />,
            tone: "sky",
          },
          {
            label: "Payouts",
            icon: <Banknote className="h-4 w-4" />,
            tone: "violet",
          },
          {
            label: "Export ledger",
            icon: <Download className="h-4 w-4" />,
            tone: "slate",
          },
        ]}
        columns={2}
      />
    </div>

    <ActivityFeed
      title="Money movement today"
      items={data.recentActivity.map((item) => ({
        id: item.id,
        who: "system",
        what: item.title,
        when: item.time,
        tag: { label: "Activity", tone: "emerald" as const },
      }))}
    />

    <AIInsightsWidget categories={["billing_anomaly", "compliance_risk"]} />
  </div>
  );
};

export default BillingOfficerHome;
