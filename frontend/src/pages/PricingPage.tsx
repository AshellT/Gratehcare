import {
  PLAN_FEATURES,
  type BillingCycle,
  type Plan,
  type PlanFeature,
  type PlanId,
} from "@/lib/plans";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Star,
  Users,
  X,
  Zap,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { usePlanCta } from "@/hooks/usePlanCta";
import { buildDemoPath } from "@/lib/signupPlan";

// ─── Feature icon map ─────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Shift rostering": <Zap className="h-4 w-4" />,
  "AI roster optimisation": <Brain className="h-4 w-4" />,
  "AI care insights": <Brain className="h-4 w-4" />,
  "AI billing anomaly detection": <Brain className="h-4 w-4" />,
  "AI compliance risk score": <Shield className="h-4 w-4" />,
  "Multi-tenant management": <Users className="h-4 w-4" />,
};

const SECTIONS = [
  {
    heading: "Core limits",
    keys: ["staff_limit", "client_limit", "storage", "api_calls"],
  },
  {
    heading: "Rostering & workforce",
    keys: ["rostering", "open_shifts", "shift_offers", "ai_rostering"],
  },
  {
    heading: "Care delivery",
    keys: ["care_plans", "care_notes", "medication", "care_ai"],
  },
  {
    heading: "Billing & finance",
    keys: [
      "invoicing",
      "ndis_claims",
      "bulk_claims",
      "billing_ai",
      "family_billing",
    ],
  },
  {
    heading: "Compliance",
    keys: ["compliance", "ai_compliance", "audit_logs", "corrective"],
  },
  {
    heading: "Reports & analytics",
    keys: ["reports", "custom_reports", "export", "analytics"],
  },
  { heading: "Portals", keys: ["family_portal", "practitioner"] },
  {
    heading: "Integrations & API",
    keys: ["integrations", "api_access", "webhooks", "sso", "custom_domain"],
  },
  {
    heading: "Support",
    keys: ["support", "onboarding", "sla", "multi_tenant"],
  },
];

// ─── Cell renderer ────────────────────────────────────────────────────────────

const FeatureCell: React.FC<{ value: string | boolean }> = ({ value }) => {
  if (value === true)
    return (
      <Check
        className="h-5 w-5 text-emerald-500 mx-auto"
        aria-label="Included"
      />
    );
  if (value === false)
    return (
      <X className="h-5 w-5 text-slate-300 mx-auto" aria-label="Not included" />
    );
  return <span className="text-sm text-slate-700 font-medium">{value}</span>;
};

// ─── Comparison table (collapsible per section) ───────────────────────────────

const ComparisonTable: React.FC<{ cycle: BillingCycle; plans: Plan[] }> = ({
  cycle,
  plans,
}) => {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Core limits": true,
    "Rostering & workforce": true,
  });
  const toggle = (h: string) => setOpen((s) => ({ ...s, [h]: !s[h] }));
  const limitValue = (value: number | "unlimited") =>
    value === "unlimited" ? "Unlimited" : `Up to ${value}`;
  const dynamicFeatures = PLAN_FEATURES.map((feature) => {
    if (feature.key === "staff_limit") {
      return {
        ...feature,
        start: limitValue(plans[0].limits.staff),
        pro: limitValue(plans[1].limits.staff),
        elite: limitValue(plans[2].limits.staff),
      };
    }
    if (feature.key === "client_limit") {
      return {
        ...feature,
        start: limitValue(plans[0].limits.clients),
        pro: limitValue(plans[1].limits.clients),
        elite: limitValue(plans[2].limits.clients),
      };
    }
    if (feature.key === "storage") {
      return {
        ...feature,
        start: plans[0].limits.storage,
        pro: plans[1].limits.storage,
        elite: plans[2].limits.storage,
      };
    }
    if (feature.key === "api_calls") {
      return {
        ...feature,
        start: plans[0].limits.apiCalls,
        pro: plans[1].limits.apiCalls,
        elite: plans[2].limits.apiCalls,
      };
    }
    return feature;
  });
  const byKey = Object.fromEntries(dynamicFeatures.map((f) => [f.key, f]));

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Sticky column headers */}
      <table className="min-w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="w-1/3 px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
              Feature
            </th>
            {plans.map((plan) => (
              <th key={plan.id} className="px-6 py-4 text-center">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${plan.badgeBg}`}
                >
                  {plan.popular && <Star className="h-3 w-3 fill-current" />}
                  {plan.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {cycle === "monthly"
                    ? `$${plan.monthlyPrice}/mo`
                    : `$${plan.annualPrice}/mo`}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section) => {
            const isOpen = open[section.heading] ?? false;
            const sectionRows = section.keys
              .map((k) => byKey[k])
              .filter(Boolean) as PlanFeature[];

            return (
              <React.Fragment key={section.heading}>
                {/* Section toggle row */}
                <tr
                  className="cursor-pointer select-none bg-slate-50/70 hover:bg-slate-100/60 transition-colors"
                  onClick={() => toggle(section.heading)}
                >
                  <td colSpan={4} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {section.heading}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                  </td>
                </tr>
                <AnimatePresence initial={false}>
                  {isOpen &&
                    sectionRows.map((feature, i) => (
                      <motion.tr
                        key={feature.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: i * 0.02 }}
                        className={`border-b border-slate-100 ${feature.highlight ? "bg-indigo-50/30" : ""}`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            {feature.highlight && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                                {SECTION_ICONS[feature.label] ?? (
                                  <Zap className="h-3 w-3" />
                                )}
                              </span>
                            )}
                            {feature.label}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCell value={feature.start} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCell value={feature.pro} />
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <FeatureCell value={feature.elite} />
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Can I change plans at any time?",
    a: "Yes. Upgrades take effect immediately and you're billed a prorated difference. Downgrades apply at the end of the current billing period.",
  },
  {
    q: "Is there a free trial?",
    a: "All plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What counts as a 'staff member'?",
    a: "Any active user with a staff-related role (support worker, care coordinator, operations admin, etc.). Family and practitioner portal users are free and don't count.",
  },
  {
    q: "How does annual billing work?",
    a: "You pay 12 months upfront at the discounted monthly rate. Savings range from 14% on Start to 17% on Elite.",
  },
  {
    q: "Can I add extra seats beyond my plan limit?",
    a: "Yes. Additional seats are available at $4/mo per staff member (Start & Pro). Elite includes unlimited seats.",
  },
  {
    q: "Do you offer discounts for NFPs and registered charities?",
    a: "Yes — contact our sales team for not-for-profit pricing. We also offer government provider bundles.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data is retained for 90 days after cancellation. You can request a full export at any time at no charge.",
  },
  {
    q: "Is GRATEHCARE NDIS-compliant?",
    a: "Yes. GRATEHCARE is built specifically for Australian care providers and aligns with NDIS Quality and Safeguards requirements.",
  },
];

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-slate-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Plan card ────────────────────────────────────────────────────────────────

const CARD_HIGHLIGHTS: Record<PlanId, string[]> = {
  start: [
    "Up to 15 staff · 40 clients",
    "Shift rostering & care plans",
    "NDIS invoicing (manual claims)",
    "Compliance credential tracking",
    "Standard reports + CSV export",
    "Email support",
  ],
  pro: [
    "Up to 75 staff · 200 clients",
    "AI rostering & care insights",
    "Automated NDIS bulk claims",
    "AI billing anomaly detection",
    "Family & practitioner portals",
    "Custom report builder",
    "Priority email + live chat",
  ],
  elite: [
    "Unlimited staff & clients",
    "Multi-tenant management",
    "Single sign-on (SSO)",
    "AI compliance risk scoring",
    "White-glove onboarding",
    "Dedicated Customer Success Manager",
    "99.9% SLA guarantee",
  ],
};

const planLimitText = (value: number | "unlimited") =>
  value === "unlimited" ? "Unlimited" : `Up to ${value}`;

const cardHighlightsFor = (plan: Plan) => {
  const [, ...rest] = CARD_HIGHLIGHTS[plan.id];
  const limitSummary =
    plan.limits.staff === "unlimited" && plan.limits.clients === "unlimited"
      ? "Unlimited staff & clients"
      : `${planLimitText(plan.limits.staff)} staff · ${planLimitText(plan.limits.clients)} clients`;
  return [limitSummary, ...rest];
};

interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  selected: PlanId;
  onSelect: (id: PlanId) => void;
  onCta: (id: PlanId) => void;
  onSubscribe: (id: PlanId) => void;
  ctaLabel: string;
  busy: boolean;
  signedIn: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  cycle,
  selected,
  onSelect,
  onCta,
  onSubscribe,
  ctaLabel,
  busy,
  signedIn,
}) => {
  const price = cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const isSelected = selected === plan.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative flex flex-col rounded-2xl border-2 bg-white transition-all ${
        plan.popular
          ? "border-indigo-500 shadow-xl shadow-indigo-100"
          : isSelected
            ? "border-slate-400 shadow-lg"
            : "border-slate-200 shadow-sm"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
            <Star className="h-3 w-3 fill-white" /> Most popular
          </span>
        </div>
      )}

      {/* Header */}
      <div
        className={`rounded-t-2xl bg-gradient-to-br ${plan.color} p-6 text-white`}
      >
        <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
          {plan.name}
        </div>
        <div className="mt-3 flex items-end gap-1">
          <span className="font-display text-4xl font-bold">${price}</span>
          <span className="mb-1 text-sm font-medium opacity-80">/ mo</span>
        </div>
        {cycle === "annual" && (
          <div className="mt-1 text-xs font-semibold opacity-80">
            Billed ${price * 12} / year · Save $
            {(plan.monthlyPrice - plan.annualPrice) * 12}/yr
          </div>
        )}
        <p className="mt-3 text-sm leading-relaxed opacity-90">
          {plan.tagline}
        </p>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 p-6">
        {cardHighlightsFor(plan).map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-slate-700"
          >
            <Check
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.accentText}`}
            />
            {item}
          </li>
        ))}
      </ul>

      {/* Limits */}
      <div className={`mx-6 mb-4 rounded-xl ${plan.accentBg} px-4 py-3`}>
        <div
          className={`text-xs font-bold uppercase tracking-widest ${plan.accentText} mb-2`}
        >
          Usage limits
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
          <span className="text-slate-500">Staff</span>
          <span className="font-semibold">
            {plan.limits.staff === "unlimited"
              ? "Unlimited"
              : `Up to ${plan.limits.staff}`}
          </span>
          <span className="text-slate-500">Clients</span>
          <span className="font-semibold">
            {plan.limits.clients === "unlimited"
              ? "Unlimited"
              : `Up to ${plan.limits.clients}`}
          </span>
          <span className="text-slate-500">Storage</span>
          <span className="font-semibold">{plan.limits.storage}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 pt-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => onCta(plan.id)}
          className={`w-full rounded-full py-3 text-sm font-bold transition-all disabled:opacity-60 ${
            plan.popular
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {busy ? (
            <Loader2 className="inline h-4 w-4 animate-spin" />
          ) : (
            <>
              {ctaLabel}
              <ArrowRight className="ml-1.5 inline h-4 w-4" />
            </>
          )}
        </button>
        {!signedIn && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSubscribe(plan.id)}
            className="mt-2 w-full text-center text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-60"
          >
            Subscribe now with card
          </button>
        )}
        <p className="mt-2 text-center text-xs text-slate-500">
          {signedIn
            ? "Stay signed in — Stripe returns you to Plan & billing."
            : "14-day trial · No credit card required"}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans } = usePlanCatalog();
  const { signedIn, busyPlan, error, primaryLabel, startTrial, startCheckout } =
    usePlanCta();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selected, setSelected] = useState<PlanId>("pro");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    if (error) notify(error);
  }, [error]);

  const handleCta = (planId: PlanId) => {
    setSelected(planId);
    if (signedIn) {
      void startCheckout(planId);
      return;
    }
    startTrial(planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 z-[200] -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700">
            <Zap className="h-3.5 w-3.5" /> Simple, transparent pricing
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            The right plan for every
            <br className="hidden sm:block" /> care organisation
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
            Launch, grow and scale your care business with GRATEHCARE. Every plan
            includes a&nbsp;14-day free trial — no credit card required.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {(["monthly", "annual"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                cycle === c
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Annual"}
              {c === "annual" && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Save up to 17%
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              selected={selected}
              onSelect={setSelected}
              onCta={handleCta}
              onSubscribe={(id) => {
                setSelected(id);
                void startCheckout(id);
              }}
              ctaLabel={primaryLabel(plan.id)}
              busy={busyPlan === plan.id}
              signedIn={signedIn}
            />
          ))}
        </div>

        {/* Enterprise callout */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Custom enterprise
              </div>
              <h3 className="mt-1 font-display text-xl font-bold">
                Running a large platform or government program?
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Multi-region, custom SLAs, dedicated infrastructure, compliance
                tailoring and bespoke integrations.
              </p>
            </div>
            <button
              onClick={() => navigate(buildDemoPath({ type: "enterprise", source: "pricing-enterprise" }))}
              className="flex-shrink-0 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors"
            >
              Talk to sales
            </button>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Full feature comparison
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Expand each section to see what's included on every plan.
          </p>
        </div>
        <ComparisonTable cycle={cycle} plans={plans} />
      </section>

      {/* Trusted by */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by leading care providers
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
            {[
              "Meridian Care",
              "Horizon Support",
              "Blue River Health",
              "Nova Disability Services",
              "Apex Allied Health",
            ].map((org) => (
              <span key={org} className="text-sm font-bold text-slate-400">
                {org}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-20">
        <h2 className="font-display text-2xl font-bold text-center text-slate-900 mb-8">
          Frequently asked questions
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="font-display text-3xl font-bold">
            Start your 14-day free trial today
          </h2>
          <p className="mt-3 text-indigo-200">
            No credit card. No lock-in. Cancel anytime. Full access to all Pro
            features during your trial.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleCta("pro")}
              className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 shadow-lg hover:bg-indigo-50 transition-colors"
            >
              Get started free
            </button>
            <button
              onClick={() => navigate(buildDemoPath({ plan: "pro", source: "pricing-bottom" }))}
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PricingPage;
