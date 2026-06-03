// ─── Plan definitions ─────────────────────────────────────────────────────────

export type PlanId = "start" | "pro" | "elite";
export type BillingCycle = "monthly" | "annual";

export interface PlanFeature {
  key: string;
  label: string;
  /** string = specific value, true = included, false = excluded */
  start: string | boolean;
  pro: string | boolean;
  elite: string | boolean;
  /** If true, shown prominently in the plan card */
  highlight?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // per month, billed annually
  currency: "AUD";
  color: string; // Tailwind gradient classes
  accentText: string; // Tailwind text class
  accentBg: string; // Tailwind bg class
  badgeBg: string; // Tailwind classes for the plan badge
  popular?: boolean;
  trial?: boolean;
  limits: {
    staff: number | "unlimited";
    clients: number | "unlimited";
    storage: string;
    apiCalls: string;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  start: {
    id: "start",
    name: "GRATEHCARE Start",
    tagline: "Everything you need to launch a compliant care business.",
    monthlyPrice: 89,
    annualPrice: 74,
    currency: "AUD",
    color: "from-slate-600 to-slate-800",
    accentText: "text-slate-700",
    accentBg: "bg-slate-100",
    badgeBg: "bg-slate-100 text-slate-700",
    limits: {
      staff: 15,
      clients: 40,
      storage: "10 GB",
      apiCalls: "50k / mo",
    },
  },
  pro: {
    id: "pro",
    name: "GRATEHCARE Pro",
    tagline: "For growing organisations that need AI, automation and depth.",
    monthlyPrice: 199,
    annualPrice: 165,
    currency: "AUD",
    color: "from-indigo-600 to-violet-600",
    accentText: "text-indigo-700",
    accentBg: "bg-indigo-50",
    badgeBg: "bg-indigo-100 text-indigo-700",
    popular: true,
    limits: {
      staff: 75,
      clients: 200,
      storage: "100 GB",
      apiCalls: "500k / mo",
    },
  },
  elite: {
    id: "elite",
    name: "GRATEHCARE Elite",
    tagline: "Enterprise-grade power for large providers and platform owners.",
    monthlyPrice: 499,
    annualPrice: 415,
    currency: "AUD",
    color: "from-violet-600 to-purple-700",
    accentText: "text-violet-700",
    accentBg: "bg-violet-50",
    badgeBg: "bg-violet-100 text-violet-700",
    limits: {
      staff: "unlimited",
      clients: "unlimited",
      storage: "1 TB",
      apiCalls: "Unlimited",
    },
  },
};

// ─── Feature comparison table ─────────────────────────────────────────────────

export const PLAN_FEATURES: PlanFeature[] = [
  // Core
  {
    key: "staff_limit",
    label: "Staff members",
    start: "Up to 15",
    pro: "Up to 75",
    elite: "Unlimited",
    highlight: true,
  },
  {
    key: "client_limit",
    label: "Clients",
    start: "Up to 40",
    pro: "Up to 200",
    elite: "Unlimited",
    highlight: true,
  },
  {
    key: "storage",
    label: "Document storage",
    start: "10 GB",
    pro: "100 GB",
    elite: "1 TB",
  },
  {
    key: "api_calls",
    label: "API calls",
    start: "50k / mo",
    pro: "500k / mo",
    elite: "Unlimited",
  },
  // Rostering
  {
    key: "rostering",
    label: "Shift rostering",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "open_shifts",
    label: "Open shift matching",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "shift_offers",
    label: "Automated shift offers",
    start: false,
    pro: true,
    elite: true,
  },
  {
    key: "ai_rostering",
    label: "AI roster optimisation",
    start: false,
    pro: true,
    elite: true,
    highlight: true,
  },
  // Care
  {
    key: "care_plans",
    label: "Care plans",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "care_notes",
    label: "Care notes",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "medication",
    label: "Medication management",
    start: "Basic",
    pro: true,
    elite: true,
  },
  {
    key: "care_ai",
    label: "AI care insights",
    start: false,
    pro: true,
    elite: true,
    highlight: true,
  },
  // Billing
  { key: "invoicing", label: "Invoicing", start: true, pro: true, elite: true },
  {
    key: "ndis_claims",
    label: "NDIS claims",
    start: "Manual",
    pro: true,
    elite: true,
  },
  {
    key: "bulk_claims",
    label: "Bulk claim submission",
    start: false,
    pro: true,
    elite: true,
  },
  {
    key: "billing_ai",
    label: "AI billing anomaly detection",
    start: false,
    pro: true,
    elite: true,
    highlight: true,
  },
  {
    key: "family_billing",
    label: "Family portal – billing",
    start: false,
    pro: true,
    elite: true,
  },
  // Compliance
  {
    key: "compliance",
    label: "Compliance tracking",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "ai_compliance",
    label: "AI compliance risk score",
    start: false,
    pro: "Basic",
    elite: true,
    highlight: true,
  },
  {
    key: "audit_logs",
    label: "Audit logs",
    start: "30 days",
    pro: "1 year",
    elite: "Unlimited",
  },
  {
    key: "corrective",
    label: "Corrective actions",
    start: false,
    pro: true,
    elite: true,
  },
  // Reporting
  {
    key: "reports",
    label: "Standard reports",
    start: true,
    pro: true,
    elite: true,
  },
  {
    key: "custom_reports",
    label: "Custom report builder",
    start: false,
    pro: true,
    elite: true,
  },
  {
    key: "export",
    label: "Data export (CSV / XLSX)",
    start: "CSV only",
    pro: true,
    elite: true,
  },
  {
    key: "analytics",
    label: "Advanced analytics",
    start: false,
    pro: true,
    elite: true,
  },
  // Portals
  {
    key: "family_portal",
    label: "Family portal",
    start: false,
    pro: true,
    elite: true,
    highlight: true,
  },
  {
    key: "practitioner",
    label: "Practitioner portal",
    start: false,
    pro: true,
    elite: true,
  },
  // Integrations
  {
    key: "integrations",
    label: "Third-party integrations",
    start: "2",
    pro: "10",
    elite: "Unlimited",
  },
  {
    key: "api_access",
    label: "REST API access",
    start: false,
    pro: true,
    elite: true,
  },
  { key: "webhooks", label: "Webhooks", start: false, pro: true, elite: true },
  {
    key: "sso",
    label: "Single sign-on (SSO)",
    start: false,
    pro: false,
    elite: true,
    highlight: true,
  },
  {
    key: "custom_domain",
    label: "Custom domain",
    start: false,
    pro: false,
    elite: true,
  },
  // Support
  {
    key: "support",
    label: "Support",
    start: "Email",
    pro: "Priority email + chat",
    elite: "Dedicated CSM",
  },
  {
    key: "onboarding",
    label: "Onboarding",
    start: "Self-serve",
    pro: "Guided setup",
    elite: "White-glove",
  },
  {
    key: "sla",
    label: "SLA guarantee",
    start: false,
    pro: "99.5%",
    elite: "99.9%",
  },
  {
    key: "multi_tenant",
    label: "Multi-tenant management",
    start: false,
    pro: false,
    elite: true,
    highlight: true,
  },
];

// ─── Feature-gate helper ─────────────────────────────────────────────────────

export function planHasFeature(
  planId: PlanId | undefined,
  featureKey: string,
): boolean {
  if (!planId) return false;
  const feature = PLAN_FEATURES.find((f) => f.key === featureKey);
  if (!feature) return false;
  const val = feature[planId];
  return val !== false && val !== undefined;
}

export function planFeatureValue(
  planId: PlanId | undefined,
  featureKey: string,
): string | boolean {
  if (!planId) return false;
  const feature = PLAN_FEATURES.find((f) => f.key === featureKey);
  if (!feature) return false;
  return feature[planId];
}

export const DEMO_SUBSCRIPTION = {
  planId: "pro" as PlanId,
  cycle: "monthly" as BillingCycle,
  status: "active" as "active" | "trial" | "past_due" | "cancelled",
  trialEndsAt: null as string | null,
  currentPeriodEnd: new Date().toISOString().slice(0, 10),
  seats: { used: 0, total: 0 },
  storageGb: { used: 0, total: 0 },
};

export const PLAN_LIST: Plan[] = [PLANS.start, PLANS.pro, PLANS.elite];

const PLAN_OVERRIDES_KEY = "gratehcare.plan.overrides";

export type PlanPriceOverride = Partial<
  Pick<Plan, "name" | "tagline" | "monthlyPrice" | "annualPrice"> & {
    limits: Partial<Plan["limits"]>;
  }
>;

export type PlanOverrides = Partial<Record<PlanId, PlanPriceOverride>>;

const applyPlanOverrides = (overrides: PlanOverrides): Plan[] =>
  PLAN_LIST.map((plan) => {
    const override = overrides[plan.id];
    if (!override) return plan;

    return {
      ...plan,
      ...override,
      limits: {
        ...plan.limits,
        ...(override.limits || {}),
      },
    };
  });

export const readPlanOverrides = (): PlanOverrides => {
  try {
    const raw = localStorage.getItem(PLAN_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as PlanOverrides) : {};
  } catch {
    return {};
  }
};

export const getPlanCatalog = (): Plan[] => applyPlanOverrides(readPlanOverrides());

export const savePlanOverride = (
  planId: PlanId,
  override: PlanPriceOverride,
): Plan[] => {
  const next = { ...readPlanOverrides(), [planId]: override };
  localStorage.setItem(PLAN_OVERRIDES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("gratehcare:plans-updated"));
  return applyPlanOverrides(next);
};

export const resetPlanOverrides = (): Plan[] => {
  localStorage.removeItem(PLAN_OVERRIDES_KEY);
  window.dispatchEvent(new Event("gratehcare:plans-updated"));
  return PLAN_LIST;
};
