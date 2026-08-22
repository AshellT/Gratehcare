import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ServerCog,
  Activity,
  Plus,
  KeyRound,
  AlertTriangle,
  Wallet,
  Tag,
} from "lucide-react";
import { tenantsApi } from "@/lib/api/tenants";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import Card from "@/components/dashboard/Card";
import { useRoleHomeData } from "@/hooks/useRoleHomeData";

const SuperAdminHome: React.FC = () => {
  const navigate = useNavigate();
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const [mrr, setMrr] = useState<number | null>(null);

  useEffect(() => {
    tenantsApi
      .platformRevenue()
      .then((report) => setMrr(report.mrr))
      .catch(() => setMrr(0));
  }, []);

  return (
    <div className="space-y-8">
      <RoleGreeting
        actions={[
          {
            label: "System health",
            variant: "secondary",
            icon: <ServerCog className="h-4 w-4" />,
            onClick: () => navigate("/app/system"),
          },
          {
            label: "Add user",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => navigate("/app/users?action=create"),
          },
        ]}
      />

      <KpiGrid
        items={[
          {
            label: "Tenants",
            value: loading ?? String(data.tenants),
            tone: "indigo",
            icon: <Building2 className="h-5 w-5" />,
          },
          {
            label: "Users",
            value: loading ?? String(data.users),
            tone: "sky",
            icon: <Users className="h-5 w-5" />,
          },
          {
            label: "MRR received",
            value: mrr === null ? "..." : `$${mrr.toLocaleString()}`,
            tone: "emerald",
            icon: <Wallet className="h-5 w-5" />,
          },
          {
            label: "Open compliance",
            value: loading ?? String(data.openCompliance),
            tone: "amber",
            icon: <AlertTriangle className="h-5 w-5" />,
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card
          title="Service health"
          description="Connect monitoring to show live service status."
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            No service health data connected yet.
          </div>
        </Card>

        <AlertsWidget title="Critical signals" alerts={[]} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <QuickActions
          actions={[
            {
              label: "New tenant",
              icon: <Plus className="h-4 w-4" />,
              tone: "indigo",
              onClick: () => navigate("/app/tenants?action=create"),
            },
            {
              label: "Add user",
              icon: <Users className="h-4 w-4" />,
              tone: "violet",
              onClick: () => navigate("/app/users?action=create"),
            },
            {
              label: "Open audit log",
              icon: <Activity className="h-4 w-4" />,
              tone: "slate",
              onClick: () => navigate("/app/audit-logs"),
            },
            {
              label: "Permissions",
              icon: <KeyRound className="h-4 w-4" />,
              tone: "amber",
              onClick: () => navigate("/app/permissions"),
            },
            {
              label: "Platform revenue",
              icon: <Wallet className="h-4 w-4" />,
              tone: "emerald",
              onClick: () => navigate("/app/revenue"),
            },
            {
              label: "Plans & billing",
              icon: <Tag className="h-4 w-4" />,
              tone: "violet",
              onClick: () => navigate("/app/plans"),
            },
          ]}
        />

        <WorkQueue
          className="lg:col-span-2"
          title="Pending admin actions"
          items={[]}
          onViewAll={() => navigate("/app/users")}
        />
      </div>

      <ActivityFeed
        title="Recent system activity"
        items={data.recentActivity.map((item) => ({
          id: item.id,
          who: "system",
          what: item.title,
          when: item.time,
          tag: { label: "Activity", tone: "slate" as const },
        }))}
      />
    </div>
  );
};

export default SuperAdminHome;
