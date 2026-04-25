import React from "react";
import {
  CalendarCheck,
  Activity,
  TrendingUp,
  MessageSquare,
  Clock,
  ClipboardList,
  AlertTriangle,
  MapPin,
  Play,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";

const SupportWorkerHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Care notes", variant: "secondary", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Clock in", icon: <Play className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "My shifts today", value: "4", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Care notes due", value: "2", tone: "amber", icon: <Activity className="h-5 w-5" /> },
        { label: "Hours this week", value: "32h", tone: "emerald", icon: <TrendingUp className="h-5 w-5" /> },
        { label: "Messages", value: "5", tone: "sky", icon: <MessageSquare className="h-5 w-5" /> },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="My shifts today"
        description="Tap to clock in / out"
        items={[
          { id: "s1", primary: "09:00 – 11:00 · Eleanor Rivers", secondary: "Morning visit · Bondi", meta: "Now", badge: { label: "Active", tone: "emerald", dot: true } },
          { id: "s2", primary: "12:30 – 14:00 · Marcus Thompson", secondary: "Lunch & meds · Surry Hills", meta: "in 2h", badge: { label: "Upcoming", tone: "indigo", dot: true } },
          { id: "s3", primary: "15:00 – 17:00 · Alana Williams", secondary: "Therapy · Paddington", meta: "in 4h", badge: { label: "Upcoming", tone: "indigo", dot: true } },
          { id: "s4", primary: "19:00 – 21:00 · Henry Park", secondary: "Evening care · Balmain", meta: "later", badge: { label: "Upcoming", tone: "indigo", dot: true } },
        ]}
      />

      <AlertsWidget
        title="Heads up"
        alerts={[
          { id: "sw1", severity: "warning", title: "Care notes overdue", description: "2 visits from yesterday still need notes.", cta: "Add notes", meta: "1d" },
          { id: "sw2", severity: "info", title: "First aid certificate renewing", description: "Expires in 28 days. Book session.", cta: "Book renewal", meta: "28d" },
          { id: "sw3", severity: "success", title: "You hit 4.9★ this week", description: "Eleanor and Marcus both rated you 5.", meta: "this wk" },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Clock in", icon: <Play className="h-4 w-4" />, tone: "emerald" },
          { label: "Care note", icon: <ClipboardList className="h-4 w-4" />, tone: "indigo" },
          { label: "Incident", icon: <AlertTriangle className="h-4 w-4" />, tone: "rose" },
          { label: "Kilometres", icon: <MapPin className="h-4 w-4" />, tone: "sky" },
          { label: "Timesheet", icon: <Clock className="h-4 w-4" />, tone: "amber" },
          { label: "Message coord.", icon: <MessageSquare className="h-4 w-4" />, tone: "violet" },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="My recent activity"
        items={[
          { id: "sw-a1", who: "You", what: "logged a care note for Eleanor R.", when: "12m ago", tag: { label: "Note", tone: "indigo" } },
          { id: "sw-a2", who: "Coordinator", what: "approved your overtime request", when: "1h ago", tag: { label: "Payroll", tone: "emerald" } },
          { id: "sw-a3", who: "You", what: "completed Marcus T.'s morning visit", when: "3h ago", tag: { label: "Visit", tone: "sky" } },
          { id: "sw-a4", who: "Family · Eleanor", what: "thanked you for yesterday", when: "Yesterday", tag: { label: "Family", tone: "violet" } },
        ]}
      />
    </div>
  </div>
);

export default SupportWorkerHome;
