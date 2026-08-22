import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { usePlanCta } from "@/hooks/usePlanCta";
import type { Plan, PlanId } from "@/lib/plans";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import React from "react";

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

const limitText = (value: number | "unlimited") =>
  value === "unlimited" ? "Unlimited" : `Up to ${value}`;

const highlightItems = (plan: Plan) => {
  const [_, ...rest] = CARD_HIGHLIGHTS[plan.id];
  const limitSummary =
    plan.limits.staff === "unlimited" && plan.limits.clients === "unlimited"
      ? "Unlimited staff & clients"
      : `${limitText(plan.limits.staff)} staff · ${limitText(plan.limits.clients)} clients`;
  return [limitSummary, ...rest];
};

const Pricing: React.FC = () => {
  const { plans } = usePlanCatalog();
  const { signedIn, busyPlan, primaryLabel, startTrial, startCheckout } = usePlanCta();

  return (
    <section
      id="pricing"
      data-testid="pricing-section"
      className="relative overflow-hidden bg-slate-50 py-24 lg:py-32"
    >
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Simple, fair pricing
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Pricing that grows with your team.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            14-day free trial. No credit card. Cancel any time.
          </p>
        </motion.div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              data-testid={`pricing-tier-${plan.id}`}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 lg:p-10 ${
                plan.popular
                  ? "z-10 border border-slate-900 bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 lg:scale-105"
                  : "border border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Most popular
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {plan.name}
                </h3>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-bold tracking-tight">
                    ${plan.monthlyPrice}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    / mo
                  </span>
                </div>
                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    plan.popular ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {plan.tagline}
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {highlightItems(plan).map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                        plan.popular ? "bg-indigo-500/30" : "bg-indigo-50"
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 ${
                          plan.popular ? "text-indigo-200" : "text-indigo-600"
                        }`}
                        strokeWidth={3}
                      />
                    </span>
                    <span className={plan.popular ? "text-slate-200" : "text-slate-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                className={`mt-6 rounded-2xl px-4 py-4 ${
                  plan.popular ? "bg-white/10" : plan.accentBg
                }`}
              >
                <div
                  className={`text-xs font-bold uppercase tracking-widest ${
                    plan.popular ? "text-slate-300" : plan.accentText
                  }`}
                >
                  Usage limits
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className={plan.popular ? "text-slate-400" : "text-slate-500"}>Staff</dt>
                  <dd className="font-semibold">{limitText(plan.limits.staff)}</dd>
                  <dt className={plan.popular ? "text-slate-400" : "text-slate-500"}>Clients</dt>
                  <dd className="font-semibold">{limitText(plan.limits.clients)}</dd>
                  <dt className={plan.popular ? "text-slate-400" : "text-slate-500"}>Storage</dt>
                  <dd className="font-semibold">{plan.limits.storage}</dd>
                </dl>
              </div>

              <button
                type="button"
                disabled={Boolean(busyPlan)}
                onClick={() => void (signedIn ? startCheckout(plan.id) : startTrial(plan.id))}
                data-testid={`pricing-cta-${plan.id}`}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all disabled:opacity-60 ${
                  plan.popular
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {busyPlan === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  primaryLabel(plan.id)
                )}
              </button>
              {!signedIn && (
                <button
                  type="button"
                  disabled={Boolean(busyPlan)}
                  onClick={() => void startCheckout(plan.id)}
                  className={`mt-2 inline-flex items-center justify-center text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-60 ${
                    plan.popular ? "text-slate-300" : "text-indigo-600"
                  }`}
                >
                  Subscribe now with card
                </button>
              )}
              <p
                className={`mt-3 text-center text-xs ${
                  plan.popular ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {signedIn
                  ? "You'll stay signed in and return here after Stripe checkout."
                  : "14-day trial · No credit card required"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
