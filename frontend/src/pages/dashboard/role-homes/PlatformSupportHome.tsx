import React from "react";
import {
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Search,
  BookOpen,
  RefreshCcw,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";

const PlatformSupportHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Knowledge base", variant: "secondary", icon: <BookOpen className="h-4 w-4" /> },
        { label: "New ticket", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Open tickets", value: "32", tone: "amber", icon: <Headphones className="h-5 w-5" /> },
        { label: "Resolved today", value: "18", tone: "emerald", icon: <CheckCircle2 className="h-5 w-5" />, delta: { value: "+4 vs avg", direction: "up" } },
        { label: "Avg. response", value: "12m", tone: "indigo", icon: <Clock className="h-5 w-5" />, delta: { value: "-3m", direction: "up" } },
        { label: "CSAT (30d)", value: "4.8/5", tone: "sky", icon: <Sparkles className="h-5 w-5" /> },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="My active tickets"
        description="Sorted by priority"
        items={[
          { id: "tk-2841", primary: "#TK-2841 · Login failing for Aurora staff", secondary: "Aurora Disability · 18 users impacted", meta: "5m", badge: { label: "P0", tone: "rose", dot: true } },
          { id: "tk-2840", primary: "#TK-2840 · Claim export missing 2 columns", secondary: "Meridian", meta: "22m", badge: { label: "P1", tone: "amber", dot: true } },
          { id: "tk-2839", primary: "#TK-2839 · Schedule sync delayed > 5 min", secondary: "Northwind", meta: "1h", badge: { label: "P1", tone: "amber", dot: true } },
          { id: "tk-2838", primary: "#TK-2838 · Mobile menu glitch on iOS 17", secondary: "Brightpath", meta: "2h", badge: { label: "P3", tone: "slate", dot: true } },
        ]}
      />

      <AlertsWidget
        title="Escalations"
        alerts={[
          { id: "ps1", severity: "critical", title: "Aurora P0 SLA breach in 14m", description: "Login outage. Notify on-call engineer.", cta: "Page on-call", meta: "now" },
          { id: "ps2", severity: "warning", title: "Spike in tenant 'Brightpath' errors", description: "5xx rate up 4x last hour.", cta: "Check status page", meta: "20m" },
          { id: "ps3", severity: "info", title: "Weekly status email scheduled", description: "Sends Monday 9am to all tenants.", meta: "tomorrow" },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Search tickets", icon: <Search className="h-4 w-4" />, tone: "indigo" },
          { label: "Impersonate user", icon: <Sparkles className="h-4 w-4" />, tone: "violet" },
          { label: "Re-sync tenant", icon: <RefreshCcw className="h-4 w-4" />, tone: "sky" },
          { label: "New macro reply", icon: <Plus className="h-4 w-4" />, tone: "emerald" },
        ]}
      />

      <ActivityFeed
        className="lg:col-span-2"
        title="Recent tenant activity"
        items={[
          { id: "ps-a1", who: "Aurora Disability", what: "opened P0 ticket · login outage", when: "5m ago", tag: { label: "Critical", tone: "rose" } },
          { id: "ps-a2", who: "Meridian", what: "imported 42 new clients", when: "1h ago", tag: { label: "Bulk", tone: "indigo" } },
          { id: "ps-a3", who: "Brightpath", what: "changed billing plan to Growth", when: "3h ago", tag: { label: "Plan", tone: "emerald" } },
          { id: "ps-a4", who: "Caretide", what: "completed onboarding wizard", when: "Yesterday", tag: { label: "Onboarding", tone: "sky" } },
        ]}
      />
    </div>
  </div>
);

export default PlatformSupportHome;
