import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import {
  AlertTriangle,
  BookOpen,
  FileBadge,
  GraduationCap,
  Plus,
  ShieldCheck,
} from "lucide-react";
import React from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
import RoleGreeting from "./RoleGreeting";
import { useNavigate } from "react-router-dom";

const ComplianceOfficerHome: React.FC = () => {
  const data = useRoleHomeData();
  const loading = data.loading ? "..." : undefined;
  const navigate = useNavigate();
  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Audit logs", variant: "secondary", icon: <FileBadge className="h-4 w-4" />, onClick: () => navigate("/app/audit-logs") },
        { label: "New incident", icon: <Plus className="h-4 w-4" />, onClick: () => navigate("/app/incidents?action=create") },
      ]}
    />

    <KpiGrid
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Expiring credentials"
        description="Address before they lapse"
        items={[]}
      />

      <AlertsWidget
        title="Risk radar"
        alerts={[]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          {
            label: "New credential",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
            onClick: () => navigate("/app/staff-credentials?action=create"),
          },
          {
            label: "New policy",
            icon: <BookOpen className="h-4 w-4" />,
            tone: "sky",
            onClick: () => navigate("/app/policies?action=create"),
          },
          {
            label: "Assign training",
            icon: <GraduationCap className="h-4 w-4" />,
            tone: "violet",
            onClick: () => navigate("/app/training?action=create"),
          },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Compliance activity"
        items={[]}
      />
    </div>

    <AIInsightsWidget categories={["compliance_risk", "burnout", "care_gap"]} />
  </div>
  );
};

export default ComplianceOfficerHome;
