import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type InsightCategory =
  | "staff_assignment"
  | "client_risk"
  | "burnout"
  | "billing_anomaly"
  | "compliance_risk"
  | "care_gap";

export type InsightSeverity = "critical" | "warning" | "info" | "success";

export interface AiInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  confidence: number;
  actionLabel?: string;
  isMock: boolean;
  generatedAt: string;
}

// ─── Mock data (swap fetchInsights body when real API is available) ──────────

const MOCK_INSIGHTS: AiInsight[] = [
  {
    id: "ai-sa-001",
    category: "staff_assignment",
    severity: "warning",
    title: "3 night shifts uncovered – auto-fill available",
    description:
      "Priya Raman and Daniel Wu are available with no conflicts. Confidence 94%.",
    confidence: 94,
    actionLabel: "Auto-fill shifts",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-sa-002",
    category: "staff_assignment",
    severity: "info",
    title: "Skill mismatch on Henry P.",
    description:
      "Assigned worker lacks manual handling cert required by care plan.",
    confidence: 87,
    actionLabel: "Reassign",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-cr-001",
    category: "client_risk",
    severity: "critical",
    title: "Eleanor Rivers – elevated fall risk",
    description:
      "14-day care note trend shows increasing mobility issues. Physio review advised.",
    confidence: 91,
    actionLabel: "Schedule review",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-cr-002",
    category: "client_risk",
    severity: "warning",
    title: "Marcus Thompson – medication adherence drop",
    description:
      "4 of last 7 days with missed doses recorded. Carer check-in recommended.",
    confidence: 88,
    actionLabel: "Flag for review",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-bo-001",
    category: "burnout",
    severity: "warning",
    title: "Sara Hill – burnout risk next 14 days",
    description:
      "54 h last week, 3 consecutive doubles. Consider redistributing load.",
    confidence: 82,
    actionLabel: "Review roster",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-ba-001",
    category: "billing_anomaly",
    severity: "warning",
    title: "Claim CL-2201 unusually high duration",
    description:
      "Billed 8 h for a client whose plan caps at 4 h/day. Verify before submitting.",
    confidence: 90,
    actionLabel: "Review claim",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-cp-001",
    category: "compliance_risk",
    severity: "critical",
    title: "3 police checks expire within 7 days",
    description: "James M., Alana W., Tom R. – renewals not yet submitted.",
    confidence: 100,
    actionLabel: "Start renewals",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
  {
    id: "ai-cg-001",
    category: "care_gap",
    severity: "warning",
    title: "Eleanor R. – no physio visit in 28 days",
    description:
      "Care plan specifies fortnightly physio. Gap detected since last session.",
    confidence: 96,
    actionLabel: "Schedule visit",
    isMock: true,
    generatedAt: new Date().toISOString(),
  },
];

/**
 * Swap this function's body to call a real AI API.
 * The shape returned must match AiInsight[].
 */
async function fetchInsights(
  categories?: InsightCategory[],
): Promise<AiInsight[]> {
  // TODO: replace with real API call, e.g.:
  // const res = await fetch(`/api/v1/ai-insights?categories=${categories?.join(",") ?? ""}`);
  // return (await res.json()).insights;
  await new Promise((r) => window.setTimeout(r, 600)); // simulate latency
  if (!categories || categories.length === 0) return MOCK_INSIGHTS;
  return MOCK_INSIGHTS.filter((i) => categories.includes(i.category));
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  staff_assignment: "Staff Assignment",
  client_risk: "Client Risk",
  burnout: "Burnout Prediction",
  billing_anomaly: "Billing Anomaly",
  compliance_risk: "Compliance Risk",
  care_gap: "Care Gap",
};

const CATEGORY_TONES: Record<
  InsightCategory,
  "indigo" | "rose" | "amber" | "sky" | "violet" | "emerald"
> = {
  staff_assignment: "indigo",
  client_risk: "rose",
  burnout: "amber",
  billing_anomaly: "violet",
  compliance_risk: "sky",
  care_gap: "emerald",
};

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { Icon: React.ComponentType<{ className?: string }>; fg: string; bg: string }
> = {
  critical: { Icon: AlertCircle, fg: "text-rose-600", bg: "bg-rose-50" },
  warning: { Icon: AlertTriangle, fg: "text-amber-600", bg: "bg-amber-50" },
  info: { Icon: Info, fg: "text-indigo-600", bg: "bg-indigo-50" },
  success: { Icon: CheckCircle2, fg: "text-emerald-600", bg: "bg-emerald-50" },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  /** Filter by specific categories. Omit to show all. */
  categories?: InsightCategory[];
  /** Max number of insights to display. Defaults to 6. */
  limit?: number;
  className?: string;
}

const AIInsightsWidget: React.FC<Props> = ({
  categories,
  limit = 6,
  className,
}) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInsights(categories);
      setInsights(data.slice(0, limit));
      setRefreshedAt(new Date());
    } finally {
      setLoading(false);
    }
  }, [categories, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const criticalCount = insights.filter(
    (i) => i.severity === "critical",
  ).length;

  const headerAction = (
    <div className="flex items-center gap-2">
      {criticalCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
          {criticalCount} critical
        </span>
      )}
      <button
        onClick={load}
        disabled={loading}
        title="Refresh insights"
        className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 transition"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );

  return (
    <Card
      title="AI Insights"
      description={
        loading
          ? "Analysing…"
          : `${insights.length} insights · refreshed ${refreshedAt.toLocaleTimeString()}`
      }
      icon={<BrainCircuit className="h-4 w-4" />}
      action={headerAction}
      className={className}
    >
      {/* Mock banner */}
      {insights.some((i) => i.isMock) && (
        <div className="mx-5 mt-4 mb-2 flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
          <p className="text-[11px] text-violet-700 font-medium">
            Mock AI outputs · Structured for real API integration
          </p>
        </div>
      )}

      {loading && insights.length === 0 ? (
        <div className="px-5 py-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Generating insights…
        </div>
      ) : (
        <ul className="divide-y divide-slate-50">
          {insights.map((insight) => {
            const { Icon, fg, bg } = SEVERITY_CONFIG[insight.severity];
            const catTone = CATEGORY_TONES[insight.category];
            const isOpen = expanded === insight.id;

            return (
              <li key={insight.id}>
                <button
                  className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : insight.id)}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}
                    >
                      <Icon className={`h-4 w-4 ${fg}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900 leading-snug">
                          {insight.title}
                        </span>
                        <Badge tone={catTone}>
                          {CATEGORY_LABELS[insight.category]}
                        </Badge>
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            key="details"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                              {insight.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-[11px] text-slate-400">
                                Confidence {insight.confidence}%
                              </span>
                              {insight.actionLabel && (
                                <button className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 transition">
                                  {insight.actionLabel}
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform mt-0.5 ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default AIInsightsWidget;
