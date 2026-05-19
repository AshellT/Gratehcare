import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
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
const OrgOwnerHome: React.FC = () => (
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
          value: "184",
          tone: "indigo",
          icon: <Users className="h-5 w-5" />,
          delta: { value: "+8 mo", direction: "up" },
        },
        {
          label: "Roster fill rate",
          value: "98%",
          tone: "emerald",
          icon: <CalendarCheck className="h-5 w-5" />,
          delta: { value: "+4%", direction: "up" },
        },
        {
          label: "Outstanding A/R",
          value: "$28,420",
          tone: "amber",
          icon: <Receipt className="h-5 w-5" />,
          delta: { value: "-12%", direction: "up" },
        },
        {
          label: "Compliance score",
          value: "96%",
          tone: "sky",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <TrendCard
        className="lg:col-span-2"
        title="Revenue · last 12 months"
        description="$284k MRR · trending up"
        data={[42, 48, 55, 51, 62, 68, 72, 70, 78, 82, 88, 94]}
      />

      <AlertsWidget
        title="What needs you today"
        alerts={[
          {
            id: "oo1",
            severity: "warning",
            title: "3 night shifts at risk next week",
            description: "GRATEHCARE AI suggests Priya & Daniel.",
            cta: "Auto-fill",
            meta: "AI",
          },
          {
            id: "oo2",
            severity: "critical",
            title: "Claim CL-1182 stuck > 10 days",
            description: "Insurer: Allianz. Escalate?",
            cta: "Escalate",
            meta: "10d",
          },
          {
            id: "oo3",
            severity: "info",
            title: "8 credentials expiring this month",
            description: "1 critical (James M.).",
            cta: "Review",
            meta: "30d",
          },
        ]}
      />
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
        title="Top performers this month"
        description="By client satisfaction & visits"
        items={[
          {
            id: "p1",
            primary: "Priya Raman",
            secondary: "98 visits · 4.9★ avg",
            meta: "+18%",
            badge: { label: "Coordinator", tone: "indigo" },
          },
          {
            id: "p2",
            primary: "Daniel Wu",
            secondary: "84 visits · 4.8★ avg",
            meta: "+12%",
            badge: { label: "Support worker", tone: "rose" },
          },
          {
            id: "p3",
            primary: "Sara Hill",
            secondary: "76 visits · 4.9★ avg",
            meta: "+9%",
            badge: { label: "Operations", tone: "sky" },
          },
          {
            id: "p4",
            primary: "Tom Reed",
            secondary: "71 visits · 4.7★ avg",
            meta: "+2%",
            badge: { label: "Billing", tone: "emerald" },
          },
        ]}
      />
    </div>

    <ActivityFeed
      title="Across your organization"
      items={[
        {
          id: "oo-a1",
          who: "Priya R.",
          what: "updated Eleanor R.'s care plan",
          when: "12m ago",
          tag: { label: "Care", tone: "indigo" },
        },
        {
          id: "oo-a2",
          who: "Daniel W.",
          what: "submitted claim CL-2189 ($1,420)",
          when: "1h ago",
          tag: { label: "Billing", tone: "emerald" },
        },
        {
          id: "oo-a3",
          who: "James O.",
          what: "logged incident INC-481",
          when: "3h ago",
          tag: { label: "Incident", tone: "amber" },
        },
        {
          id: "oo-a4",
          who: "Sara H.",
          what: "imported 18 new shifts for next week",
          when: "Yesterday",
          tag: { label: "Schedule", tone: "sky" },
        },
      ]}
    />

    <AIInsightsWidget />
  </div>
);

export default OrgOwnerHome;
