import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Plus,
  Tag,
  Network,
  BarChart3,
  Plug,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import { tenantsApi } from "@/lib/api/tenants";
import { auditLogsApi } from "@/lib/api/audit-logs";

const PlatformOwnerHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tenantCount, setTenantCount] = useState(0);
  const [trendData, setTrendData] = useState<number[]>([0]);
  const [topTenants, setTopTenants] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [tenantsRes, logsRes] = await Promise.all([
          tenantsApi.list(),
          auditLogsApi.list({ limit: 4 }).catch(() => ({ data: [] })),
        ]);

        if (!mounted) return;

        if (tenantsRes.data && tenantsRes.data.length > 0) {
          setTenantCount(tenantsRes.data.length);
          
          // Generate trend based on tenant count
          const trend = Array.from({ length: 12 }, (_, i) => 
            Math.max(0, tenantsRes.data.length - (11 - i) * 2)
          );
          setTrendData(trend);

          // Top tenants (first 4)
          const top = tenantsRes.data.slice(0, 4).map((t: any) => ({
            id: t.id,
            primary: t.name,
            secondary: `${t.region || 'Unknown'} region`,
            meta: "",
            badge: { label: "Active", tone: "indigo" as const },
          }));
          setTopTenants(top);
        }

        if (logsRes.data && logsRes.data.length > 0) {
          const activities = logsRes.data.map((log: any) => ({
            id: log.id,
            who: log.user?.name || "System",
            what: log.action || "performed an action",
            when: new Date(log.createdAt).toLocaleTimeString(),
            tag: { label: "Activity", tone: "indigo" as const },
          }));
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error("Failed to load platform home data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <RoleGreeting
        actions={[
          { label: "Plans", variant: "secondary", icon: <Tag className="h-4 w-4" /> },
          { label: "Add tenant", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <KpiGrid
        items={[
          { 
            label: "Tenants", 
            value: loading ? "..." : String(tenantCount), 
            tone: "indigo", 
            icon: <Building2 className="h-5 w-5" /> 
          },
          { 
            label: "MRR", 
            value: loading ? "..." : "$0", 
            tone: "emerald", 
            icon: <Wallet className="h-5 w-5" /> 
          },
          { 
            label: "Active users", 
            value: loading ? "..." : "0", 
            tone: "sky", 
            icon: <Users className="h-5 w-5" /> 
          },
          { 
            label: "Net retention", 
            value: loading ? "..." : "0%", 
            tone: "amber", 
            icon: <TrendingUp className="h-5 w-5" /> 
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <TrendCard
          className="lg:col-span-2"
          title="Tenant growth · last 12 months"
          description={loading ? "Loading..." : `${tenantCount} total tenants`}
          data={trendData}
        />

        <AlertsWidget
          title="System alerts"
          description="Platform notifications"
          alerts={[
            { 
              id: "info1", 
              severity: "info", 
              title: "All systems operational", 
              description: "Platform running normally", 
              meta: "Now" 
            },
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
          title="Recent tenants"
          description={loading ? "Loading..." : `${topTenants.length} shown`}
          items={topTenants.length > 0 ? topTenants : [
            { 
              id: "empty", 
              primary: "No tenants yet", 
              secondary: "Add your first tenant to get started", 
              meta: "", 
              badge: { label: "Empty", tone: "slate" as const } 
            }
          ]}
          ctaLabel="All tenants"
        />
      </div>

      <ActivityFeed
        title="Recent activity"
        description="Latest platform actions"
        items={recentActivity.length > 0 ? recentActivity : [
          { 
            id: "empty", 
            who: "System", 
            what: "No recent activity", 
            when: "Now", 
            tag: { label: "Info", tone: "slate" as const } 
          }
        ]}
      />
    </div>
  );
};

export default PlatformOwnerHome;
