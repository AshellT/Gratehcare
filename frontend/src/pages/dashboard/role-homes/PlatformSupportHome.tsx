import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import {
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Search,
  BookOpen,
  RefreshCcw,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";

const PlatformSupportHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Knowledge base", variant: "secondary", icon: <BookOpen className="h-4 w-4" /> },
        { label: "New ticket", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Open tickets", value: loading ?? "0", tone: "amber", icon: <Headphones className="h-5 w-5" /> },
        { label: "Resolved today", value: loading ?? "0", tone: "emerald", icon: <CheckCircle2 className="h-5 w-5" /> },
        { label: "Avg. response", value: loading ?? "—", tone: "indigo", icon: <Clock className="h-5 w-5" /> },
        { label: "Tenants", value: loading ?? String(data.tenants), tone: "sky", icon: <Sparkles className="h-5 w-5" /> },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="My active tickets"
        description="Sorted by priority"
        items={[]}
      />

      <AlertsWidget
        title="Escalations"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Search tickets", icon: <Search className="h-4 w-4" />, tone: "indigo" },
          { label: "Impersonate user", icon: <Sparkles className="h-4 w-4" />, tone: "violet" },
          { label: "Re-sync tenant", icon: <RefreshCcw className="h-4 w-4" />, tone: "sky" },
          { label: "New macro reply", icon: <Plus className="h-4 w-4" />, tone: "emerald" },
        ]}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Recent tenant activity"
        items={data.recentActivity.map((item) => ({
          id: item.id,
          who: "system",
          what: item.title,
          when: item.time,
          tag: { label: "Activity", tone: "sky" as const },
        }))}
      />
    </div>
  </div>
  );
};

export default PlatformSupportHome;
