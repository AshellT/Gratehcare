import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import {
  AlertTriangle,
  BookOpen,
  Download,
  FileBadge,
  GraduationCap,
  Plus,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import React from "react";
import RoleGreeting from "./RoleGreeting";

const ComplianceOfficerHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "Audit pack",
          variant: "secondary",
          icon: <Download className="h-4 w-4" />,
        },
        { label: "New incident", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        {
          label: "Compliance score",
          value: "96%",
          tone: "emerald",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          label: "Expiring < 30d",
          value: "8",
          tone: "amber",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          label: "Open incidents",
          value: "3",
          tone: "rose",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          label: "Audit-ready",
          value: "Yes",
          tone: "indigo",
          icon: <FileBadge className="h-5 w-5" />,
        },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Expiring credentials"
        description="Address before they lapse"
        items={[
          {
            id: "co1",
            primary: "James M. · First aid certificate",
            secondary: "Expires in 4 days",
            meta: "4d",
            badge: { label: "Critical", tone: "rose", dot: true },
          },
          {
            id: "co2",
            primary: "Priya R. · Police check",
            secondary: "Expires in 12 days",
            meta: "12d",
            badge: { label: "Soon", tone: "amber", dot: true },
          },
          {
            id: "co3",
            primary: "Daniel W. · Vehicle insurance",
            secondary: "Expires in 21 days",
            meta: "21d",
            badge: { label: "Soon", tone: "amber", dot: true },
          },
          {
            id: "co4",
            primary: "Sara H. · NDIS clearance",
            secondary: "Expires in 28 days",
            meta: "28d",
            badge: { label: "Soon", tone: "amber", dot: true },
          },
        ]}
      />

      <AlertsWidget
        title="Risk radar"
        alerts={[
          {
            id: "co-r1",
            severity: "critical",
            title: "INC-481 Slip & fall pending RCA",
            description: "48h SLA breach in 6h.",
            cta: "Open incident",
            meta: "6h",
          },
          {
            id: "co-r2",
            severity: "warning",
            title: "12 staff overdue training",
            description: "Manual handling refresh required.",
            cta: "Send reminders",
            meta: "12 staff",
          },
          {
            id: "co-r3",
            severity: "info",
            title: "Q1 audit scheduled",
            description: "NDIS Quality & Safeguards · Mar 14.",
            meta: "60d",
          },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          {
            label: "New credential",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
          },
          {
            label: "Send reminders",
            icon: <Send className="h-4 w-4" />,
            tone: "amber",
          },
          {
            label: "Audit pack",
            icon: <Download className="h-4 w-4" />,
            tone: "emerald",
          },
          {
            label: "New policy",
            icon: <BookOpen className="h-4 w-4" />,
            tone: "sky",
          },
          {
            label: "Assign training",
            icon: <GraduationCap className="h-4 w-4" />,
            tone: "violet",
          },
          {
            label: "Bulk review",
            icon: <Users className="h-4 w-4" />,
            tone: "slate",
          },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Compliance activity"
        items={[
          {
            id: "co-a1",
            who: "James O.",
            what: "closed incident INC-477 (near miss)",
            when: "12m ago",
            tag: { label: "Closed", tone: "emerald" },
          },
          {
            id: "co-a2",
            who: "Priya R.",
            what: "uploaded renewed police check",
            when: "1h ago",
            tag: { label: "Renewed", tone: "indigo" },
          },
          {
            id: "co-a3",
            who: "GRATEHCARE",
            what: "auto-flagged 3 expiring credentials",
            when: "3h ago",
            tag: { label: "Auto", tone: "violet" },
          },
          {
            id: "co-a4",
            who: "Daniel W.",
            what: "completed manual handling training",
            when: "Yesterday",
            tag: { label: "Training", tone: "sky" },
          },
        ]}
      />
    </div>

    <AIInsightsWidget categories={["compliance_risk", "burnout", "care_gap"]} />
  </div>
);

export default ComplianceOfficerHome;
