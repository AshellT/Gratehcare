import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    desc: "For small teams getting organized.",
    price: 49,
    cta: "Start free trial",
    highlight: false,
    features: [
      "Up to 10 staff members",
      "Smart scheduling & rosters",
      "Mobile care notes",
      "Basic compliance vault",
      "Email support",
    ],
  },
  {
    name: "Growth",
    desc: "For scaling providers ready to automate.",
    price: 129,
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
    features: [
      "Up to 50 staff members",
      "Billing, claims & invoicing",
      "Family & practitioner portals",
      "Advanced compliance & audits",
      "Lumina AI assistant",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    desc: "For multi-site organisations.",
    price: null,
    cta: "Talk to sales",
    highlight: false,
    features: [
      "Unlimited staff & locations",
      "SSO, advanced permissions",
      "Custom integrations & API",
      "Dedicated success manager",
      "Onboarding & migration",
      "99.99% SLA",
    ],
  },
];

const Pricing: React.FC = () => {
  return (
    <section
      id="pricing"
      data-testid="pricing-section"
      className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Simple, fair pricing
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Pricing that grows with your team.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            14-day free trial. No credit card. Cancel any time.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              data-testid={`pricing-tier-${tier.name.toLowerCase()}`}
              className={`relative flex flex-col rounded-3xl p-8 lg:p-10 transition-all duration-300 ${
                tier.highlight
                  ? "bg-slate-900 text-white border border-slate-900 shadow-2xl shadow-indigo-900/20 lg:scale-105 z-10"
                  : "bg-white border border-slate-200 hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  {tier.badge}
                </div>
              )}

              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {tier.name}
                </h3>
                <p
                  className={`mt-2 text-sm ${
                    tier.highlight ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {tier.desc}
                </p>
              </div>

              <div className="mt-6 flex items-baseline gap-1.5">
                {tier.price !== null ? (
                  <>
                    <span className="font-display text-5xl font-bold tracking-tight">
                      ${tier.price}
                    </span>
                    <span
                      className={`text-sm ${
                        tier.highlight ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      / mo
                    </span>
                  </>
                ) : (
                  <span className="font-display text-4xl font-bold tracking-tight">
                    Custom
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                        tier.highlight ? "bg-indigo-500/30" : "bg-indigo-50"
                      }`}
                    >
                      <Check
                        className={`h-3 w-3 ${
                          tier.highlight ? "text-indigo-200" : "text-indigo-600"
                        }`}
                        strokeWidth={3}
                      />
                    </span>
                    <span
                      className={
                        tier.highlight ? "text-slate-200" : "text-slate-700"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                data-testid={`pricing-cta-${tier.name.toLowerCase()}`}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  tier.highlight
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
