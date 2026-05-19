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
  Sparkles,
  Users,
} from "lucide-react";
import React from "react";
import RoleGreeting from "./RoleGreeting";

const CareCoordinatorHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "Open schedule",
          variant: "secondary",
          icon: <CalendarRange className="h-4 w-4" />,
        },
        { label: "New shift", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        {
          label: "Shifts today",
          value: "86",
          tone: "indigo",
          icon: <CalendarCheck className="h-5 w-5" />,
        },
        {
          label: "Unfilled",
          value: "12",
          tone: "amber",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          label: "Active clients",
          value: "184",
          tone: "sky",
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Care plans due",
          value: "7",
          tone: "rose",
          icon: <HeartPulse className="h-5 w-5" />,
        },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Unfilled shifts"
        description="Your hottest priority for today"
        items={[
          {
            id: "u1",
            primary: "Night · 22:00–06:00 · Eleanor R.",
            secondary: "No worker assigned · home visit",
            meta: "tonight",
            badge: { label: "Open", tone: "amber", dot: true },
          },
          {
            id: "u2",
            primary: "Morning · 07:00–11:00 · Marcus T.",
            secondary: "Original called in sick",
            meta: "3h",
            badge: { label: "Urgent", tone: "rose", dot: true },
          },
          {
            id: "u3",
            primary: "Evening · 17:00–21:00 · Alana W.",
            secondary: "Therapy session",
            meta: "today",
            badge: { label: "Open", tone: "amber", dot: true },
          },
          {
            id: "u4",
            primary: "Day · 09:00–13:00 · Henry P.",
            secondary: "Personal care",
            meta: "today",
            badge: { label: "Open", tone: "amber", dot: true },
          },
        ]}
      />

      <AlertsWidget
        title="AI suggestions"
        description="GRATEHCARE AI thinks you should..."
        alerts={[
          {
            id: "cc1",
            severity: "info",
            title: "Auto-fill 3 night shifts with Priya & Daniel",
            description: "Both available, no conflicts.",
            cta: "Apply suggestion",
            meta: "AI",
          },
          {
            id: "cc2",
            severity: "warning",
            title: "Eleanor R. care plan review overdue",
            description: "Last reviewed 92 days ago.",
            cta: "Schedule review",
            meta: "92d",
          },
          {
            id: "cc3",
            severity: "info",
            title: "Marcus T. expressed satisfaction concerns",
            description: "Sentiment dropped in last 3 notes.",
            cta: "Family check-in",
            meta: "AI",
          },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          {
            label: "New shift",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
          },
          {
            label: "Roster builder",
            icon: <CalendarRange className="h-4 w-4" />,
            tone: "sky",
          },
          {
            label: "New care plan",
            icon: <HeartPulse className="h-4 w-4" />,
            tone: "rose",
          },
          {
            label: "Care note",
            icon: <ClipboardList className="h-4 w-4" />,
            tone: "emerald",
          },
          {
            label: "AI auto-fill",
            icon: <Sparkles className="h-4 w-4" />,
            tone: "violet",
          },
          {
            label: "Message family",
            icon: <MessageSquare className="h-4 w-4" />,
            tone: "amber",
          },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Today's activity"
        items={[
          {
            id: "cc-a1",
            who: "Priya R.",
            what: "completed Eleanor's morning visit",
            when: "12m ago",
            tag: { label: "Visit", tone: "indigo" },
          },
          {
            id: "cc-a2",
            who: "Daniel W.",
            what: "swapped Tuesday afternoon shift",
            when: "1h ago",
            tag: { label: "Schedule", tone: "sky" },
          },
          {
            id: "cc-a3",
            who: "Family · Eleanor",
            what: "messaged: 'Thanks for the update'",
            when: "2h ago",
            tag: { label: "Family", tone: "violet" },
          },
          {
            id: "cc-a4",
            who: "GRATEHCARE AI",
            what: "flagged shift fatigue risk for Sara H.",
            when: "Yesterday",
            tag: { label: "AI", tone: "rose" },
          },
        ]}
      />
    </div>

    <AIInsightsWidget
      categories={["staff_assignment", "client_risk", "burnout", "care_gap"]}
    />
  </div>
);

export default CareCoordinatorHome;
