import React from "react";
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Sparkles,
  Plus,
  Tag,
  Network,
  BarChart3,
  Plug,
  ShieldCheck,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";

const PlatformOwnerHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Plans", variant: "secondary", icon: <Tag className="h-4 w-4" /> },
        { label: "Add tenant", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        { label: "Tenants", value: "1,284", tone: "indigo", icon: <Building2 className="h-5 w-5" />, delta: { value: "+42 mo", direction: "up" } },
        { label: "MRR", value: "$284,910", tone: "emerald", icon: <Wallet className="h-5 w-5" />, delta: { value: "+12%", direction: "up" } },
        { label: "Active users", value: "18,420", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "Net retention", value: "118%", tone: "amber", icon: <TrendingUp className="h-5 w-5" />, delta: { value: "+3%", direction: "up" } },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <TrendCard
        className="lg:col-span-2"
        title="MRR · last 12 months"
        description="$3.42M ARR · trending up"
        data={[142, 158, 168, 184, 210, 224, 248, 256, 272, 284, 296, 318]}
      />

      <AlertsWidget
        title="Strategic alerts"
        description="What needs the founder's eye"
        alerts={[
          { id: "po1", severity: "warning", title: "Aurora's NRR dipped to 91%", description: "Retention dropped 6pts last 30d. Consider exec touch.", cta: "Open account", meta: "1h" },
          { id: "po2", severity: "info", title: "3 enterprise prospects in pipeline", description: "Total ACV $182k. Sales review tomorrow.", cta: "Review pipeline", meta: "Today" },
          { id: "po3", severity: "success", title: "Platform uptime 99.99%", description: "Quarter-best. SLA exceeded across all regions.", meta: "QTD" },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Invite tenant", icon: <Plus className="h-4 w-4" />, tone: "indigo" },
          { label: "Open revenue", icon: <Wallet className="h-4 w-4" />, tone: "emerald" },
          { label: "Network map", icon: <Network className="h-4 w-4" />, tone: "sky" },
          { label: "Plans & pricing", icon: <Tag className="h-4 w-4" />, tone: "violet" },
          { label: "Integrations", icon: <Plug className="h-4 w-4" />, tone: "amber" },
          { label: "Reports", icon: <BarChart3 className="h-4 w-4" />, tone: "slate" },
        ]}
        columns={3}
      />

      <WorkQueue
        className="lg:col-span-2"
        title="Top tenants this month"
        description="Sorted by usage growth"
        items={[
          { id: "t1", primary: "Meridian Home Care", secondary: "184 staff · $4,820 MRR", meta: "+18%", badge: { label: "Enterprise", tone: "violet" } },
          { id: "t2", primary: "Aurora Disability", secondary: "142 staff · $3,640 MRR", meta: "+12%", badge: { label: "Growth", tone: "indigo" } },
          { id: "t3", primary: "Northwind Care", secondary: "98 staff · $2,420 MRR", meta: "+9%", badge: { label: "Growth", tone: "indigo" } },
          { id: "t4", primary: "Brightpath", secondary: "76 staff · $1,920 MRR", meta: "+6%", badge: { label: "Growth", tone: "indigo" } },
        ]}
        ctaLabel="All tenants"
      />
    </div>

    <ActivityFeed
      title="Boardroom feed"
      description="What changed across the platform today"
      items={[
        { id: "a1", who: "Sales", what: "closed Brightpath upgrade ($1.9k → $2.4k MRR)", when: "12m ago", tag: { label: "Revenue", tone: "emerald" } },
        { id: "a2", who: "GRATEHCARE AI", what: "auto-resolved 18 staffing risks across 6 tenants", when: "1h ago", tag: { label: "AI", tone: "violet" } },
        { id: "a3", who: "Compliance", what: "exported Q4 SOC 2 evidence pack", when: "3h ago", tag: { label: "Trust", tone: "indigo" } },
        { id: "a4", who: "System", what: "scaled background workers to 12 instances", when: "Yesterday", tag: { label: "Infra", tone: "slate" } },
      ]}
    />
  </div>
);

export default PlatformOwnerHome;
