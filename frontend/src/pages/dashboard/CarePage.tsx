import React, { useEffect, useState } from "react";
import { Plus, FileText, Target, Activity, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { careApi } from "@/lib/api/care";
import { useToast } from "@/context/ToastContext";

type CareGoal = { title: string; progress: number; status: string };

type RawCarePlan = {
  id: string;
  title: string;
  goals: CareGoal[] | string[];
  status: string;
  reviewDue?: string;
};

type RawCareNote = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  staff?: { title?: string; user?: { fullName?: string } };
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const normalizeGoals = (goals: RawCarePlan["goals"]): CareGoal[] => {
  if (!Array.isArray(goals)) return [];
  return goals.map((goal) =>
    typeof goal === "string"
      ? { title: goal, progress: 0, status: "on-track" }
      : goal,
  );
};

const CarePage: React.FC = () => {
  const toast = useToast();
  const [plan, setPlan] = useState<RawCarePlan | null>(null);
  const [notes, setNotes] = useState<RawCareNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [plansRes, notesRes] = await Promise.all([
          careApi.listPlans({ limit: 1 }),
          careApi.listNotes({ limit: 5 }),
        ]);
        if (!mounted) return;
        setPlan(((plansRes.data ?? [])[0] as unknown as RawCarePlan) ?? null);
        setNotes((notesRes.data ?? []) as unknown as RawCareNote[]);
      } catch {
        if (mounted) toast.error("Failed to load care data", "Could not fetch care plans or notes.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const goals = plan ? normalizeGoals(plan.goals) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Care plans"
        description="Living care plans, goals and outcomes for every client."
        actions={[
          { label: "Templates", variant: "secondary", icon: <FileText className="h-4 w-4" /> },
          { label: "New care plan", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading care plans…
        </div>
      ) : !plan ? (
        <Card title="No care plans yet" description="Create a care plan to track goals and outcomes.">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No active care plans found in the backend.
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card
            className="lg:col-span-2"
            title={plan.title}
            description={
              plan.reviewDue
                ? `Review due ${new Date(plan.reviewDue).toLocaleDateString()}`
                : "Active care plan"
            }
          >
            <Badge tone="emerald" dot>
              {plan.status.toLowerCase()}
            </Badge>

            <div className="space-y-4 mt-5">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <Target className="h-3.5 w-3.5" />
                Goals & outcomes
              </div>
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500">No goals recorded yet.</p>
              ) : (
                goals.map((g) => (
                  <div key={g.title} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">{g.title}</div>
                      <Badge tone={g.status === "exceeded" ? "emerald" : "indigo"}>{g.progress}%</Badge>
                    </div>
                    <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          g.status === "exceeded" ? "bg-emerald-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card title="Vitals trend" description="Last 14 days" icon={<Activity className="h-4 w-4" />}>
            <p className="text-sm text-slate-500">
              Vitals integration is not configured. Connect devices or manual vitals entry to populate trends.
            </p>
          </Card>
        </div>
      )}

      <Card title="Recent care notes" description="From the team this week">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500">No care notes yet.</p>
        ) : (
          <ul className="space-y-4">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-slate-200 p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                    <div className="text-[10px] text-slate-500">
                      {n.staff?.user?.fullName ?? n.staff?.title ?? "Care team"} · {timeAgo(n.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default CarePage;
