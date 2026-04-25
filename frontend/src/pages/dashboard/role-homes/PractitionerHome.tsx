import React from "react";
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

const PractitionerHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Open schedule", variant: "secondary", icon: <CalendarCheck className="h-4 w-4" /> },
        { label: "New care plan", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Active patients", value: "42", tone: "indigo", icon: <Users className="h-5 w-5" /> },
        { label: "Plans due review", value: "6", tone: "amber", icon: <Stethoscope className="h-5 w-5" /> },
        { label: "Sessions this week", value: "18", tone: "emerald", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Outcomes met", value: "87%", tone: "sky", icon: <Activity className="h-5 w-5" />, delta: { value: "+5%", direction: "up" } },
      ]}
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
        alerts={[
          { id: "pr1", severity: "warning", title: "Eleanor R. care plan overdue", description: "Last reviewed 92 days ago.", cta: "Schedule review", meta: "92d" },
          { id: "pr2", severity: "info", title: "New referral · Olivier Chen", description: "Aged Care Package · physio.", cta: "Accept", meta: "today" },
          { id: "pr3", severity: "success", title: "Marcus T. exceeded mobility goal", description: "100% range achieved 4 weeks early.", meta: "this wk" },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Care plans due review"
        description="Overdue first"
        items={[
          { id: "pr-q1", primary: "Eleanor Rivers", secondary: "Last review 92 days ago", meta: "Overdue", badge: { label: "Overdue", tone: "rose", dot: true } },
          { id: "pr-q2", primary: "Marcus Thompson", secondary: "Last review 64 days ago", meta: "26d", badge: { label: "Soon", tone: "amber", dot: true } },
          { id: "pr-q3", primary: "Alana Williams", secondary: "Last review 41 days ago", meta: "49d", badge: { label: "Upcoming", tone: "indigo", dot: true } },
          { id: "pr-q4", primary: "Henry Park", secondary: "Last review 30 days ago", meta: "60d", badge: { label: "Upcoming", tone: "indigo", dot: true } },
        ]}
      />

      <QuickActions
        actions={[
          { label: "New care plan", icon: <Plus className="h-4 w-4" />, tone: "indigo" },
          { label: "Add session note", icon: <ClipboardList className="h-4 w-4" />, tone: "emerald" },
          { label: "Set outcome", icon: <Target className="h-4 w-4" />, tone: "sky" },
          { label: "Patient list", icon: <Users className="h-4 w-4" />, tone: "violet" },
          { label: "Schedule", icon: <CalendarCheck className="h-4 w-4" />, tone: "amber" },
          { label: "Message team", icon: <MessageSquare className="h-4 w-4" />, tone: "slate" },
        ]}
        columns={2}
      />
    </div>

    <ActivityFeed
      title="Clinical activity"
      items={[
        { id: "pr-a1", who: "You", what: "completed Eleanor's physio review", when: "12m ago", tag: { label: "Session", tone: "indigo" } },
        { id: "pr-a2", who: "Coordinator", what: "referred Olivier Chen for physiotherapy", when: "1h ago", tag: { label: "Referral", tone: "violet" } },
        { id: "pr-a3", who: "You", what: "logged outcome for Marcus T. (100%)", when: "3h ago", tag: { label: "Outcome", tone: "emerald" } },
        { id: "pr-a4", who: "Family · Eleanor", what: "messaged about progress", when: "Yesterday", tag: { label: "Family", tone: "sky" } },
      ]}
    />
  </div>
);

export default PractitionerHome;
