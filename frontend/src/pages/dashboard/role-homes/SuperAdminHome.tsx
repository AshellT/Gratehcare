import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ServerCog,
  Activity,
  Plus,
  KeyRound,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
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
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const loading = data.loading ? "..." : undefined;

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const openAction = (text: string) => {
    setSelectedAction(text);
    notify(text);
  };

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

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

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
            label: "Clients",
            value: loading ?? String(data.clients),
            tone: "emerald",
            icon: <Activity className="h-5 w-5" />,
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
          ]}
        />

        <WorkQueue
          className="lg:col-span-2"
          title="Pending admin actions"
          items={[]}
          onViewAll={() => navigate("/app/users")}
        />
      </div>

      {selectedAction && (
        <Card title="Action workspace" description="Selected admin action">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">{selectedAction}</div>
              <div className="mt-1 text-xs text-slate-500">
                This workflow is ready for the next backend integration step.
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedAction(null);
                notify("Action dismissed.");
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dismiss
            </button>
          </div>
        </Card>
      )}

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
