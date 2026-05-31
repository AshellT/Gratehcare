import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Target } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { careApi } from "@/lib/api/care";
import type { CarePlan } from "@/lib/api/types";
import { useToast } from "@/context/ToastContext";

type OutcomeRow = {
  id: string;
  clientName: string;
  goal: string;
  status: string;
  coordinator: string;
};

const OutcomesPage: React.FC = () => {
  const toast = useToast();
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await careApi.listPlans({ limit: 50 });
        if (mounted) setPlans(res.data ?? []);
      } catch {
        if (mounted) toast.error("Failed to load outcomes", "Could not fetch care plan goals.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const outcomes = useMemo((): OutcomeRow[] => {
    const rows: OutcomeRow[] = [];
    for (const plan of plans) {
      for (const goal of plan.goals ?? []) {
        rows.push({
          id: `${plan.id}-${goal.slice(0, 12)}`,
          clientName: plan.clientName,
          goal,
          status: plan.status,
          coordinator: plan.coordinator,
        });
      }
      if (!plan.goals?.length) {
        rows.push({
          id: plan.id,
          clientName: plan.clientName,
          goal: "No goals documented yet",
          status: plan.status,
          coordinator: plan.coordinator,
        });
      }
    }
    return rows;
  }, [plans]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clinical"
        title="Outcomes"
        description="Care plan goals and outcome measures across active clients."
      />

      <Card title="Goal tracker" description="Goals extracted from active care plans." icon={<Target className="h-4 w-4" />}>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading outcomes…
          </div>
        ) : outcomes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No outcomes yet</div>
            <p className="mt-1 text-sm text-slate-500">Add goals to care plans to track outcomes here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {outcomes.map((row) => (
              <li key={row.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{row.clientName}</div>
                    <p className="mt-1 text-sm text-slate-600">{row.goal}</p>
                    <div className="mt-2 text-xs text-slate-500">Coordinator: {row.coordinator}</div>
                  </div>
                  <Badge tone={row.status === "review_due" ? "amber" : "emerald"}>{row.status.replace(/_/g, " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default OutcomesPage;
