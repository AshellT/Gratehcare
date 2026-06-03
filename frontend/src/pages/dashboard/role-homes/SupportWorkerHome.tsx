import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import {
  CalendarCheck,
  Activity,
  TrendingUp,
  MessageSquare,
  Clock,
  ClipboardList,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { useNavigate } from "react-router-dom";

const SupportWorkerHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const navigate = useNavigate();
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Care notes", variant: "secondary", icon: <ClipboardList className="h-4 w-4" />, onClick: () => navigate("/app/care-notes") },
        { label: "New care note", icon: <ClipboardList className="h-4 w-4" />, onClick: () => navigate("/app/care-notes?action=create") },
      ]}
    />

    <KpiGrid
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="My shifts today"
        description="Tap to clock in / out"
        items={[]}
      />

      <AlertsWidget
        title="Heads up"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Care note", icon: <ClipboardList className="h-4 w-4" />, tone: "indigo", onClick: () => navigate("/app/care-notes?action=create") },
          { label: "Incident", icon: <AlertTriangle className="h-4 w-4" />, tone: "rose", onClick: () => navigate("/app/incidents?action=create") },
          { label: "Kilometres", icon: <MapPin className="h-4 w-4" />, tone: "sky", onClick: () => navigate("/app/timesheets?action=create") },
          { label: "Timesheet", icon: <Clock className="h-4 w-4" />, tone: "amber", onClick: () => navigate("/app/timesheets?action=create") },
          { label: "Message coord.", icon: <MessageSquare className="h-4 w-4" />, tone: "violet", onClick: () => navigate("/app/messages") },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="My recent activity"
        items={[]}
      />
    </div>
  </div>
  );
};

export default SupportWorkerHome;
