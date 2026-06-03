import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Activity,
  Plus,
  Target,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import { useNavigate } from "react-router-dom";

const PractitionerHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const navigate = useNavigate();
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Open schedule", variant: "secondary", icon: <CalendarCheck className="h-4 w-4" />, onClick: () => navigate("/app/practitioner-overview") },
        { label: "New evaluation", icon: <Plus className="h-4 w-4" />, onClick: () => navigate("/app/practitioner-evaluations?action=create") },
      ]}
    />

    <KpiGrid
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <TrendCard
        className="lg:col-span-2"
        title="Outcomes met · last 12 weeks"
        description="87% this week · trending up"
        data={[68, 72, 70, 74, 76, 78, 80, 82, 81, 84, 85, 87]}
        color="#14b8a6"
      />

      <AlertsWidget
        title="Clinical attention"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Care plans due review"
        description="Overdue first"
        items={[]}
      />

      <QuickActions
        actions={[
          { label: "New evaluation", icon: <Plus className="h-4 w-4" />, tone: "indigo", onClick: () => navigate("/app/practitioner-evaluations?action=create") },
          { label: "Add session note", icon: <ClipboardList className="h-4 w-4" />, tone: "emerald", onClick: () => navigate("/app/practitioner-clinical-notes?action=create") },
          { label: "Outcomes", icon: <Target className="h-4 w-4" />, tone: "sky", onClick: () => navigate("/app/outcomes") },
          { label: "Patient list", icon: <Users className="h-4 w-4" />, tone: "violet", onClick: () => navigate("/app/practitioner-clients") },
          { label: "Schedule", icon: <CalendarCheck className="h-4 w-4" />, tone: "amber", onClick: () => navigate("/app/practitioner-overview") },
          { label: "Message team", icon: <MessageSquare className="h-4 w-4" />, tone: "slate", onClick: () => navigate("/app/practitioner-messages") },
        ]}
        columns={2}
      />
    </div>

    <ActivityFeed
      title="Clinical activity"
      items={[]}
    />
  </div>
  );
};

export default PractitionerHome;
