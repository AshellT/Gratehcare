import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/dashboard/Badge";
import { Wallet, TrendingUp, Users, Activity } from "lucide-react";
import { tenantsApi } from "@/lib/api/tenants";

const money = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);

const RevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Awaited<
    ReturnType<typeof tenantsApi.platformRevenue>
  > | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await tenantsApi.platformRevenue();
        if (mounted) setReport(data);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Could not load platform revenue.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const mrr = report?.mrr ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Revenue"
        description="Money received from paying GRATEHCARE subscriptions across every organisation."
        actions={[
          {
            label: "Manage plans",
            onClick: () => navigate("/app/plans"),
            variant: "secondary",
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="MRR received"
          value={loading ? "..." : money(mrr)}
          hint={report ? `${report.payingTenants} paying orgs` : undefined}
          tone="indigo"
          icon={<Wallet className="h-5 w-5" />}
          index={0}
        />
        <StatCard
          label="ARR"
          value={loading ? "..." : money(report?.arr ?? 0)}
          tone="emerald"
          icon={<TrendingUp className="h-5 w-5" />}
          index={1}
        />
        <StatCard
          label="Paying tenants"
          value={loading ? "..." : String(report?.payingTenants ?? 0)}
          hint={report ? `${report.trialTenants} on trial` : undefined}
          tone="sky"
          icon={<Users className="h-5 w-5" />}
          index={2}
        />
        <StatCard
          label="Paid retention"
          value={loading ? "..." : `${report?.netRetentionPct ?? 0}%`}
          hint={report ? `${report.cancelledTenants} cancelled` : undefined}
          tone="amber"
          icon={<Activity className="h-5 w-5" />}
          index={3}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Revenue by plan" description="Monthly amount from paying organisations.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading…</div>
          ) : (
            <div className="space-y-4">
              {(report?.byPlan ?? []).map((plan) => {
                const pct = mrr > 0 ? Math.round((plan.mrr / mrr) * 100) : 0;
                return (
                  <div key={plan.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-800">{plan.name}</span>
                      <span className="font-bold text-slate-900">{money(plan.mrr)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {plan.paying} paying · {plan.trial} trial · {money(plan.monthlyPrice)}/mo
                    </div>
                  </div>
                );
              })}
              {mrr === 0 && (
                <p className="text-sm text-slate-500">
                  No paid subscriptions yet. Trial pipeline is {money(report?.trialPipelineMrr ?? 0)}/mo
                  if those organisations convert.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card
          title="Organisations"
          description="Latest tenants and whether they are paying."
        >
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading…</div>
          ) : (report?.recentTenants ?? []).length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No organisations yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {report?.recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{tenant.name}</div>
                    <div className="text-xs text-slate-500 capitalize">
                      {tenant.planId} · {tenant.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {tenant.paying ? money(tenant.monthlyPrice) : money(0)}
                    </div>
                    <Badge tone={tenant.paying ? "emerald" : tenant.status === "trial" ? "amber" : "slate"}>
                      {tenant.paying ? "Paying" : tenant.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
