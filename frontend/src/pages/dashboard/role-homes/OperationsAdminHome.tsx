import React from "react";
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

const OperationsAdminHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Reports", variant: "secondary", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Build roster", icon: <CalendarRange className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Shifts today", value: "86", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Unfilled", value: "12", tone: "amber", icon: <AlertTriangle className="h-5 w-5" />, delta: { value: "-4 vs avg", direction: "up" } },
        { label: "Active staff", value: "124", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "On-time rate", value: "97%", tone: "emerald", icon: <Activity className="h-5 w-5" />, delta: { value: "+2%", direction: "up" } },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Today's hot list"
        description="Actions required to keep ops running"
        items={[
          { id: "op1", primary: "Fill night shift · Eleanor R.", secondary: "22:00–06:00 · No coverage", meta: "in 6h", badge: { label: "Open", tone: "amber", dot: true } },
          { id: "op2", primary: "Approve overtime · Daniel W.", secondary: "8h over 38h cap", meta: "1h", badge: { label: "Approval", tone: "indigo", dot: true } },
          { id: "op3", primary: "Reassign · Marcus T. afternoon", secondary: "Original worker called in sick", meta: "30m", badge: { label: "Urgent", tone: "rose", dot: true } },
          { id: "op4", primary: "Confirm new client visit · Maya K.", secondary: "First visit · 14:00", meta: "today", badge: { label: "Onboarding", tone: "sky", dot: true } },
        ]}
      />

      <AlertsWidget
        title="Live alerts"
        alerts={[
          { id: "oa1", severity: "critical", title: "Marcus T. shift uncovered in 30m", description: "Original worker called in sick.", cta: "Find replacement", meta: "30m" },
          { id: "oa2", severity: "warning", title: "Daniel W. approaching overtime cap", description: "8h over weekly limit.", cta: "Approve / reassign", meta: "1h" },
          { id: "oa3", severity: "info", title: "GRATEHCARE AI: 5 swaps suggested", description: "Improves coverage by 8%.", cta: "Review", meta: "AI" },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "New shift", icon: <Plus className="h-4 w-4" />, tone: "indigo" },
          { label: "Open schedule", icon: <CalendarRange className="h-4 w-4" />, tone: "sky" },
          { label: "Care plans", icon: <HeartPulse className="h-4 w-4" />, tone: "rose" },
          { label: "Compliance", icon: <ShieldCheck className="h-4 w-4" />, tone: "amber" },
          { label: "Team chat", icon: <MessageSquare className="h-4 w-4" />, tone: "violet" },
          { label: "Reports", icon: <BarChart3 className="h-4 w-4" />, tone: "slate" },
        ]}
        columns={3}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Activity stream"
        items={[
          { id: "oa-a1", who: "Priya R.", what: "covered Marcus T.'s morning visit", when: "8m ago", tag: { label: "Schedule", tone: "indigo" } },
          { id: "oa-a2", who: "GRATEHCARE AI", what: "auto-filled 3 night shifts", when: "1h ago", tag: { label: "AI", tone: "violet" } },
          { id: "oa-a3", who: "Daniel W.", what: "logged 4 care notes", when: "2h ago", tag: { label: "Care", tone: "indigo" } },
          { id: "oa-a4", who: "Sara H.", what: "approved 6 timesheets", when: "Yesterday", tag: { label: "Payroll", tone: "emerald" } },
        ]}
      />
    </div>
  </div>
);

export default OperationsAdminHome;
