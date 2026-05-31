import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import {
  BarChart3,
  CalendarCheck,
  HeartPulse,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import React from "react";
import RoleGreeting from "./RoleGreeting";

const OrgOwnerHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;

  return (
    <div className="space-y-8">
      <RoleGreeting
        actions={[
          {
            label: "Reports",
            variant: "secondary",
            icon: <BarChart3 className="h-4 w-4" />,
          },
          { label: "Quick actions", icon: <Sparkles className="h-4 w-4" /> },
        ]}
      />

      <KpiGrid
        items={[
          {
            label: "Active clients",
            value: loading ?? String(data.clients),
            tone: "indigo",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "Staff members",
            value: loading ?? String(data.staff),
            tone: "emerald",
            icon: <CalendarCheck className="h-5 w-5" />,
          },
          {
            label: "Paid revenue",
            value: loading ?? formatCurrency(data.revenue),
            tone: "amber",
            icon: <Receipt className="h-5 w-5" />,
          },
          {
            label: "Open compliance",
            value: loading ?? String(data.openCompliance),
            tone: "sky",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <TrendCard
          className="lg:col-span-2"
          title="Revenue trend"
          description={
            data.loading
              ? "Loading..."
              : data.revenue > 0
                ? `${formatCurrency(data.revenue)} paid revenue`
                : "No revenue data yet"
          }
          data={
            data.revenue > 0
              ? [0, data.revenue * 0.4, data.revenue * 0.6, data.revenue]
              : [0, 0]
          }
        />

        <AlertsWidget title="What needs you today" alerts={[]} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <QuickActions
          actions={[
            {
              label: "New client",
              icon: <Plus className="h-4 w-4" />,
              tone: "indigo",
            },
            {
              label: "Build roster",
              icon: <CalendarCheck className="h-4 w-4" />,
              tone: "sky",
            },
            {
              label: "New care plan",
              icon: <HeartPulse className="h-4 w-4" />,
              tone: "rose",
            },
            {
              label: "Send invoices",
              icon: <Receipt className="h-4 w-4" />,
              tone: "emerald",
            },
            {
              label: "Open compliance",
              icon: <ShieldCheck className="h-4 w-4" />,
              tone: "amber",
            },
            {
              label: "Bookkeeping",
              icon: <Wallet className="h-4 w-4" />,
              tone: "violet",
            },
          ]}
          columns={3}
        />

        <WorkQueue
          className="lg:col-span-2"
          title="Organization queue"
          description="Work items appear when operational data is available."
          items={[]}
        />
      </div>

      <ActivityFeed
        title="Across your organization"
        items={data.recentActivity.map((item) => ({
          id: item.id,
          who: "system",
          what: item.title,
          when: item.time,
          tag: { label: "Activity", tone: "indigo" as const },
        }))}
      />

      <AIInsightsWidget />
    </div>
  );
};

export default OrgOwnerHome;
