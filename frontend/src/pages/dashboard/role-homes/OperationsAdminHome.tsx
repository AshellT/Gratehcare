import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import {
  CalendarCheck,
  Users,
  AlertTriangle,
  Activity,
  Plus,
  CalendarRange,
  HeartPulse,
  ShieldCheck,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { useNavigate } from "react-router-dom";

const OperationsAdminHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const navigate = useNavigate();
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Reports", variant: "secondary", icon: <BarChart3 className="h-4 w-4" />, onClick: () => navigate("/app/reports") },
        { label: "Build roster", icon: <CalendarRange className="h-4 w-4" />, onClick: () => navigate("/app/rostering?action=create") },
      ]}
    />

    <KpiGrid
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Today's hot list"
        description="Actions required to keep ops running"
        items={[]}
      />

      <AlertsWidget
        title="Live alerts"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "New shift", icon: <Plus className="h-4 w-4" />, tone: "indigo", onClick: () => navigate("/app/rostering?action=create") },
          { label: "Open schedule", icon: <CalendarRange className="h-4 w-4" />, tone: "sky", onClick: () => navigate("/app/schedule") },
          { label: "Care plans", icon: <HeartPulse className="h-4 w-4" />, tone: "rose", onClick: () => navigate("/app/care-plans") },
          { label: "Compliance", icon: <ShieldCheck className="h-4 w-4" />, tone: "amber", onClick: () => navigate("/app/compliance") },
          { label: "Team chat", icon: <MessageSquare className="h-4 w-4" />, tone: "violet", onClick: () => navigate("/app/messages") },
          { label: "Reports", icon: <BarChart3 className="h-4 w-4" />, tone: "slate", onClick: () => navigate("/app/reports") },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Activity stream"
        items={[]}
      />
    </div>
  </div>
  );
};

export default OperationsAdminHome;
