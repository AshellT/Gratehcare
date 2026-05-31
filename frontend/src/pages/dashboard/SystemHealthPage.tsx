import React, { useEffect, useState } from "react";
import { Activity, Loader2, ServerCog } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/dashboard/Badge";
import { systemApi, type SystemHealth } from "@/lib/api/system";
import { useToast } from "@/context/ToastContext";

const SystemHealthPage: React.FC = () => {
  const toast = useToast();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await systemApi.getHealth();
        if (mounted) setHealth(data);
      } catch {
        if (mounted) toast.error("Failed to load system health", "Could not fetch health metrics.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="System"
        title="System health"
        description="Live platform status across tenants, integrations and support queues."
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading health metrics…
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Badge tone={health?.status === "healthy" ? "emerald" : "amber"} dot>
              {health?.status === "healthy" ? "All systems operational" : "Degraded performance"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Active tenants" value={`${health?.tenants ?? 0}`} tone="indigo" icon={<ServerCog className="h-5 w-5" />} index={0} />
            <StatCard label="Platform users" value={`${health?.users ?? 0}`} tone="sky" icon={<Activity className="h-5 w-5" />} index={1} />
            <StatCard
              label="Integrations"
              value={`${health?.integrations.enabled ?? 0}/${health?.integrations.total ?? 0}`}
              tone="emerald"
              icon={<ServerCog className="h-5 w-5" />}
              index={2}
            />
            <StatCard label="Open tickets" value={`${health?.openTickets ?? 0}`} tone="amber" icon={<Activity className="h-5 w-5" />} index={3} />
          </div>

          <Card title="Quick links" description="Jump to related system modules.">
            <div className="flex flex-wrap gap-3">
              <Link to="/app/integrations" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Integrations
              </Link>
              <Link to="/app/audit-logs" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Audit logs
              </Link>
              <Link to="/app/tickets" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Support tickets
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default SystemHealthPage;
