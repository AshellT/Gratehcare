import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  HeartPulse,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import RoleGreeting from "./RoleGreeting";
import { useNavigate } from "react-router-dom";

const CareCoordinatorHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const navigate = useNavigate();
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "Open schedule",
          variant: "secondary",
          icon: <CalendarRange className="h-4 w-4" />,
          onClick: () => navigate("/app/schedule"),
        },
        { label: "New shift", icon: <Plus className="h-4 w-4" />, onClick: () => navigate("/app/rostering?action=create") },
      ]}
    />

    <KpiGrid
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Unfilled shifts"
        description="Your hottest priority for today"
        items={[]}
      />

      <AlertsWidget
        title="AI suggestions"
        description="GRATEHCARE AI thinks you should..."
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          {
            label: "New shift",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
            onClick: () => navigate("/app/rostering?action=create"),
          },
          {
            label: "Roster builder",
            icon: <CalendarRange className="h-4 w-4" />,
            tone: "sky",
            onClick: () => navigate("/app/rostering"),
          },
          {
            label: "New care plan",
            icon: <HeartPulse className="h-4 w-4" />,
            tone: "rose",
            onClick: () => navigate("/app/care-plans?action=create"),
          },
          {
            label: "Care note",
            icon: <ClipboardList className="h-4 w-4" />,
            tone: "emerald",
            onClick: () => navigate("/app/care-notes?action=create"),
          },
          {
            label: "Message family",
            icon: <MessageSquare className="h-4 w-4" />,
            tone: "amber",
            onClick: () => navigate("/app/messages"),
          },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Today's activity"
        items={[]}
      />
    </div>

    <AIInsightsWidget
      categories={["staff_assignment", "client_risk", "burnout", "care_gap"]}
    />
  </div>
  );
};

export default CareCoordinatorHome;
