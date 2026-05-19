import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ServerCog,
  Activity,
  Plus,
  KeyRound,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import Card from "@/components/dashboard/Card";

const SuperAdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2600);
  };

  const openAction = (text: string) => {
    setSelectedAction(text);
    notify(text);
  };

  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "System health",
          variant: "secondary",
          icon: <ServerCog className="h-4 w-4" />,
          onClick: () => navigate("/app/system"),
        },
        {
          label: "Add user",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => navigate("/app/users"),
        },
      ]}
    />

    {message && (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
        {message}
      </div>
    )}

    <KpiGrid
      items={[
        { label: "Tenants", value: "1,284", tone: "indigo", icon: <Building2 className="h-5 w-5" /> },
        { label: "Users", value: "18,420", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "API uptime", value: "99.99%", tone: "emerald", icon: <Activity className="h-5 w-5" /> },
        { label: "Open issues", value: "4", tone: "amber", icon: <AlertTriangle className="h-5 w-5" /> },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Service health" description="Live status across services" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "API gateway", status: "Operational", tone: "emerald", uptime: "99.99%" },
            { label: "MongoDB cluster", status: "Operational", tone: "emerald", uptime: "100%" },
            { label: "Background jobs", status: "Degraded", tone: "amber", uptime: "98.6%" },
            { label: "Email delivery", status: "Operational", tone: "emerald", uptime: "99.97%" },
            { label: "Realtime", status: "Operational", tone: "emerald", uptime: "99.92%" },
            { label: "File storage", status: "Operational", tone: "emerald", uptime: "100%" },
          ].map((s) => (
            <div
              key={s.label}
              role="button"
              tabIndex={0}
              onClick={() => openAction(`${s.label} health details opened.`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") openAction(`${s.label} health details opened.`);
              }}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-sm font-semibold text-slate-800">{s.label}</span>
              </div>
              <div className="text-xs text-slate-500">{s.status} · {s.uptime}</div>
            </div>
          ))}
        </div>
      </Card>

      <AlertsWidget
        title="Critical signals"
        alerts={[
          { id: "sa1", severity: "critical", title: "Background jobs queue depth > 2k", description: "Aurora workers slow. Spike auto-scaling?", cta: "Scale workers", meta: "5m" },
          { id: "sa2", severity: "warning", title: "Webhook delivery failing for stripe.charge", description: "Tenant: Aurora. 12 retries in last hour.", cta: "Inspect", meta: "12m" },
          { id: "sa3", severity: "info", title: "DB migration v2024.12.04 deployed", description: "All tenants migrated successfully.", meta: "Yesterday" },
        ]}
        onAction={(alert) => {
          if (alert.cta === "Inspect") navigate("/app/system");
          else if (alert.cta === "Scale workers") openAction("Worker scaling workflow opened.");
          else openAction(`${alert.title} opened.`);
        }}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "New tenant", icon: <Plus className="h-4 w-4" />, tone: "indigo", onClick: () => navigate("/app/tenants") },
          { label: "Reset user", icon: <KeyRound className="h-4 w-4" />, tone: "amber", onClick: () => openAction("Reset user workflow opened.") },
          { label: "Re-sync tenant", icon: <RefreshCcw className="h-4 w-4" />, tone: "sky", onClick: () => openAction("Tenant re-sync queued.") },
          { label: "Open audit log", icon: <Activity className="h-4 w-4" />, tone: "slate", onClick: () => navigate("/app/audit-logs") },
        ]}
      />

      <WorkQueue
        className="lg:col-span-2"
        title="Pending admin actions"
        items={[
          { id: "u1", primary: "Approve Northwind admin role escalation", secondary: "Requested by Sara Hill", meta: "2h", badge: { label: "Approval", tone: "amber", dot: true } },
          { id: "u2", primary: "Investigate failed webhook for Aurora", secondary: "stripe.charge.succeeded", meta: "12m", badge: { label: "Critical", tone: "rose", dot: true } },
          { id: "u3", primary: "Tenant onboarding · Havenwell", secondary: "Awaiting SSO config", meta: "Today", badge: { label: "Onboarding", tone: "indigo" } },
          { id: "u4", primary: "Quarterly key rotation", secondary: "Production secrets due", meta: "3d", badge: { label: "Security", tone: "violet" } },
        ]}
        onViewAll={() => navigate("/app/users")}
        onItemClick={(item) => {
          if (item.badge?.label === "Critical") navigate("/app/system");
          else if (item.badge?.label === "Approval") openAction("Role escalation approval drawer opened.");
          else openAction(`${item.primary} opened.`);
        }}
      />
    </div>

    {selectedAction && (
      <Card title="Action workspace" description="Selected admin action">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{selectedAction}</div>
            <div className="mt-1 text-xs text-slate-500">
              This workflow is ready for the next backend integration step.
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedAction(null);
              notify("Action dismissed.");
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      </Card>
    )}

    <ActivityFeed
      title="Recent system activity"
      items={[
        { id: "sa-a1", who: "system", what: "auto-rotated JWT signing keys", when: "8m ago", tag: { label: "Security", tone: "violet" } },
        { id: "sa-a2", who: "Maria L.", what: "promoted Priya R. to Care Coordinator", when: "1h ago", tag: { label: "Roles", tone: "indigo" } },
        { id: "sa-a3", who: "system", what: "executed nightly backup (412 GB)", when: "Yesterday", tag: { label: "Infra", tone: "slate" } },
        { id: "sa-a4", who: "Sara H.", what: "imported 84 staff into Northwind", when: "Yesterday", tag: { label: "Tenants", tone: "sky" } },
      ]}
    />
  </div>
  );
};

export default SuperAdminHome;
