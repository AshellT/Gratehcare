import { Injectable } from "@nestjs/common";

// ─── Insight types ─────────────────────────────────────────────────────────
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
  confidence: number; // 0-100
  actionLabel?: string;
  meta?: Record<string, unknown>;
  /** ISO timestamp – when the AI generated this insight */
  generatedAt: string;
  /** Set to true once a real AI provider is wired in */
  isMock: boolean;
}

export interface AiInsightsSummary {
  insights: AiInsight[];
  generatedAt: string;
  tenantId: string;
}

// ─── Mock data factory ──────────────────────────────────────────────────────
// Structured so swapping in a real model (OpenAI, Azure AI, Gemini, etc.)
// only requires changing the private `fetchFromProvider` method below.

const MOCK_INSIGHTS: Omit<AiInsight, "generatedAt" | "isMock">[] = [
  // ── Staff assignment ───────────────────────────────────────────────
  {
    id: "ai-sa-001",
    category: "staff_assignment",
    severity: "warning",
    title: "3 night shifts uncovered – auto-fill available",
    description:
      "Priya Raman and Daniel Wu are available with no scheduling conflicts. Confidence: 94%.",
    confidence: 94,
    actionLabel: "Auto-fill shifts",
    meta: { affectedShifts: 3, suggestedStaff: ["Priya Raman", "Daniel Wu"] },
  },
  {
    id: "ai-sa-002",
    category: "staff_assignment",
    severity: "info",
    title: "Staff skill mismatch on client Henry P.",
    description:
      "Assigned worker lacks manual handling certification required for Henry's care plan.",
    confidence: 87,
    actionLabel: "Reassign or upskill",
    meta: { clientId: "henry-p", requiredSkill: "manual_handling" },
  },
  // ── Client risk ────────────────────────────────────────────────────
  {
    id: "ai-cr-001",
    category: "client_risk",
    severity: "critical",
    title: "Eleanor Rivers – elevated fall risk detected",
    description:
      "Care notes over 14 days indicate increased mobility issues. Suggest physio review.",
    confidence: 91,
    actionLabel: "Schedule review",
    meta: { clientId: "eleanor-r", riskType: "fall", trendDays: 14 },
  },
  {
    id: "ai-cr-002",
    category: "client_risk",
    severity: "warning",
    title: "Marcus Thompson – medication adherence drop",
    description:
      "Missed doses recorded on 4 of last 7 days. Carer check-in recommended.",
    confidence: 88,
    actionLabel: "Flag for review",
    meta: { clientId: "marcus-t", missedDoses: 4, windowDays: 7 },
  },
  // ── Burnout prediction ─────────────────────────────────────────────
  {
    id: "ai-bo-001",
    category: "burnout",
    severity: "warning",
    title: "Sara Hill – burnout risk in next 14 days",
    description:
      "Worked 54 h last week, 3 consecutive double shifts. Consider redistributing load.",
    confidence: 82,
    actionLabel: "Review roster",
    meta: { staffId: "sara-h", hoursLastWeek: 54, consecutiveDoubles: 3 },
  },
  {
    id: "ai-bo-002",
    category: "burnout",
    severity: "info",
    title: "James McGuire – elevated overtime hours",
    description: "18 % above average for the past 4 weeks. Monitor closely.",
    confidence: 74,
    actionLabel: "Review hours",
    meta: { staffId: "james-m", overtimePct: 18 },
  },
  // ── Billing anomaly ────────────────────────────────────────────────
  {
    id: "ai-ba-001",
    category: "billing_anomaly",
    severity: "critical",
    title: "Duplicate claim detected – CL-2189 & CL-2201",
    description:
      "Same client, same date, same service code. One must be voided to avoid insurer rejection.",
    confidence: 97,
    actionLabel: "Review claims",
    meta: { claimIds: ["CL-2189", "CL-2201"], serviceCode: "07_001_0106_6_3" },
  },
  {
    id: "ai-ba-002",
    category: "billing_anomaly",
    severity: "warning",
    title: "Claim CL-2195 – unit rate 12 % above benchmark",
    description:
      "Rate charged differs from approved price guide. Verify before submission.",
    confidence: 85,
    actionLabel: "Audit claim",
    meta: { claimId: "CL-2195", deviation: 12 },
  },
  // ── Compliance risk ────────────────────────────────────────────────
  {
    id: "ai-com-001",
    category: "compliance_risk",
    severity: "critical",
    title: "2 staff credentials expiring within 7 days",
    description:
      "First aid (James M.) and NDIS clearance (Priya R.) lapse this week.",
    confidence: 99,
    actionLabel: "Send renewal reminders",
    meta: {
      expiringSoon: ["James M. – First Aid", "Priya R. – NDIS clearance"],
    },
  },
  {
    id: "ai-com-002",
    category: "compliance_risk",
    severity: "warning",
    title: "Incident INC-481 – RCA overdue",
    description:
      "Root cause analysis required within 48 h of incident. 6 h remaining.",
    confidence: 100,
    actionLabel: "Start RCA",
    meta: { incidentId: "INC-481", hoursRemaining: 6 },
  },
  // ── Care gap ───────────────────────────────────────────────────────
  {
    id: "ai-cg-001",
    category: "care_gap",
    severity: "warning",
    title: "Eleanor Rivers – care plan review overdue",
    description:
      "Plan was last reviewed 92 days ago. NDIS requirement is every 90 days.",
    confidence: 100,
    actionLabel: "Schedule review",
    meta: { clientId: "eleanor-r", daysSinceReview: 92 },
  },
  {
    id: "ai-cg-002",
    category: "care_gap",
    severity: "info",
    title: "Marcus Thompson – no physio visit in 30 days",
    description: "Care plan specifies fortnightly physio. Gap detected.",
    confidence: 95,
    actionLabel: "Book appointment",
    meta: {
      clientId: "marcus-t",
      gapDays: 30,
      requiredFrequency: "fortnightly",
    },
  },
];

@Injectable()
export class AiInsightsService {
  // ── Public API ──────────────────────────────────────────────────────────

  async getSummary(
    tenantId: string,
    categories?: InsightCategory[],
  ): Promise<AiInsightsSummary> {
    const raw = await this.fetchFromProvider(tenantId);
    const filtered = categories?.length
      ? raw.filter((i) => categories.includes(i.category))
      : raw;
    return {
      insights: filtered,
      generatedAt: new Date().toISOString(),
      tenantId,
    };
  }

  async getByCategory(
    tenantId: string,
    category: InsightCategory,
  ): Promise<AiInsight[]> {
    const all = await this.fetchFromProvider(tenantId);
    return all.filter((i) => i.category === category);
  }

  async getCritical(tenantId: string): Promise<AiInsight[]> {
    const all = await this.fetchFromProvider(tenantId);
    return all.filter(
      (i) => i.severity === "critical" || i.severity === "warning",
    );
  }

  // ── Provider layer ──────────────────────────────────────────────────────
  // Replace the body of this method to integrate a real AI provider.
  // Contract: return AiInsight[] for the given tenantId.
  private async fetchFromProvider(_tenantId: string): Promise<AiInsight[]> {
    // TODO: replace with real AI provider call:
    //   const response = await openai.chat.completions.create({ ... });
    //   return parseInsights(response);
    return MOCK_INSIGHTS.map((i) => ({
      ...i,
      generatedAt: new Date().toISOString(),
      isMock: true,
    }));
  }
}
