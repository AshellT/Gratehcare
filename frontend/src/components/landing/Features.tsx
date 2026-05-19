import React from "react";
import { motion } from "framer-motion";
import {
  CalendarRange,
  Receipt,
  ShieldCheck,
  HeartPulse,
  Brain,
  ArrowUpRight,
} from "lucide-react";

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  bullets: string[];
  span: string;
  tone: "indigo" | "sky" | "emerald" | "amber" | "rose";
  visual?: React.ReactNode;
};

const toneMap: Record<string, { iconBg: string; iconFg: string; ring: string }> =
  {
    indigo: {
      iconBg: "bg-indigo-50",
      iconFg: "text-indigo-600",
      ring: "ring-indigo-100",
    },
    sky: { iconBg: "bg-sky-50", iconFg: "text-sky-600", ring: "ring-sky-100" },
    emerald: {
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-600",
      ring: "ring-emerald-100",
    },
    amber: {
      iconBg: "bg-amber-50",
      iconFg: "text-amber-700",
      ring: "ring-amber-100",
    },
    rose: { iconBg: "bg-rose-50", iconFg: "text-rose-600", ring: "ring-rose-100" },
  };

const ScheduleVisual = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="grid grid-cols-7 gap-1 text-[9px] font-semibold text-slate-400">
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} className="text-center">{d}</div>
      ))}
    </div>
    <div className="mt-1 grid grid-cols-7 gap-1">
      {Array.from({ length: 21 }).map((_, i) => {
        const filled = [1, 2, 5, 7, 9, 12, 14, 16, 18, 20].includes(i);
        const tones = ["bg-indigo-500", "bg-sky-500", "bg-emerald-500"];
        return (
          <div
            key={i}
            className={`h-6 rounded-md ${
              filled ? tones[i % 3] : "bg-slate-100"
            }`}
          />
        );
      })}
    </div>
  </div>
);

const ClaimsVisual = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
    {[
      { label: "Approved", value: "82%", color: "bg-emerald-500", w: "w-[82%]" },
      { label: "In review", value: "12%", color: "bg-amber-500", w: "w-[12%]" },
      { label: "Rejected", value: "6%", color: "bg-rose-400", w: "w-[6%]" },
    ].map((r) => (
      <div key={r.label}>
        <div className="flex items-center justify-between text-[10px] font-medium text-slate-600">
          <span>{r.label}</span>
          <span className="font-semibold text-slate-900">{r.value}</span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full ${r.color} ${r.w} rounded-full`} />
        </div>
      </div>
    ))}
  </div>
);

const ComplianceVisual = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-1.5">
    {["Police check", "First aid cert", "NDIS clearance", "Vehicle insurance"].map(
      (i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5"
        >
          <span className="text-[10px] font-medium text-slate-700">{i}</span>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
            Valid
          </span>
        </div>
      ),
    )}
  </div>
);

const CareVisual = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
      <div>
        <div className="text-[10px] font-bold text-slate-900">Eleanor R.</div>
        <div className="text-[9px] text-slate-500">Care plan · Active</div>
      </div>
    </div>
    <div className="mt-2 grid grid-cols-3 gap-1">
      {["Goals", "Notes", "Vitals"].map((t) => (
        <div
          key={t}
          className="rounded bg-slate-50 py-1 text-center text-[9px] font-semibold text-slate-700"
        >
          {t}
        </div>
      ))}
    </div>
  </div>
);

const AIVisual = () => (
  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-sky-50 p-3 shadow-sm">
    <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-700">
      GRATEHCARE AI
    </div>
    <div className="mt-1 text-[10px] font-semibold text-slate-800 leading-snug">
      "3 unfilled night shifts next week. Suggest swap with Priya & Daniel?"
    </div>
    <div className="mt-2 flex gap-1">
      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
        Apply
      </span>
      <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[9px] font-semibold text-slate-700">
        Adjust
      </span>
    </div>
  </div>
);

const features: Feature[] = [
  {
    title: "Smart Scheduling",
    desc: "Build, fill and adjust rosters in minutes — not Mondays.",
    icon: <CalendarRange className="h-5 w-5" />,
    tone: "indigo",
    span: "lg:col-span-7",
    bullets: [
      "Drag-and-drop rosters across teams and locations",
      "Auto-fill open shifts based on skills & availability",
      "Conflict, fatigue and overtime alerts in real time",
    ],
    visual: <ScheduleVisual />,
  },
  {
    title: "Billing & Claims",
    desc: "Get paid faster with automated invoices and live claim tracking.",
    icon: <Receipt className="h-5 w-5" />,
    tone: "emerald",
    span: "lg:col-span-5",
    bullets: [
      "NDIS, insurance & private billing in one ledger",
      "Auto-validate claims before submission",
      "Track payment status from invoice to deposit",
    ],
    visual: <ClaimsVisual />,
  },
  {
    title: "Compliance & Audit",
    desc: "Never panic before an audit again.",
    icon: <ShieldCheck className="h-5 w-5" />,
    tone: "sky",
    span: "lg:col-span-4",
    bullets: [
      "Centralised credential and document vault",
      "Auto-expire reminders for staff & vehicles",
      "One-click audit trails and incident reports",
    ],
    visual: <ComplianceVisual />,
  },
  {
    title: "Care Management",
    desc: "Care plans, notes and outcomes — connected to every visit.",
    icon: <HeartPulse className="h-5 w-5" />,
    tone: "rose",
    span: "lg:col-span-4",
    bullets: [
      "Living care plans with goals and progress",
      "Mobile care notes synced in real time",
      "Family portal for transparent updates",
    ],
    visual: <CareVisual />,
  },
  {
    title: "AI Insights",
    desc: "Spot risks before they happen and grow with confidence.",
    icon: <Brain className="h-5 w-5" />,
    tone: "amber",
    span: "lg:col-span-4",
    bullets: [
      "Predict shift gaps, churn and claim risks",
      "Automated anomaly detection on care notes",
      "Plain-English answers to your business questions",
    ],
    visual: <AIVisual />,
  },
];

const Features: React.FC = () => {
  return (
    <section
      id="features"
      data-testid="features-section"
      className="py-24 lg:py-32 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-end mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Everything you need
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              One platform. Every part of care.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            From rostering to reconciliation, GRATEHCARE replaces a stack of fragile
            tools with one beautifully integrated system — built for the way
            modern care providers actually work.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<Feature & { index: number }> = ({
  title,
  desc,
  icon,
  bullets,
  span,
  tone,
  visual,
  index,
}) => {
  const t = toneMap[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      data-testid={`feature-card-${title.toLowerCase().replace(/\s|&/g, "-")}`}
      className={`group relative col-span-1 ${span} rounded-3xl border border-slate-200 bg-white p-7 lg:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`inline-flex items-center justify-center h-11 w-11 rounded-xl ${t.iconBg} ${t.iconFg} ring-4 ${t.ring}`}
        >
          {icon}
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-slate-700 group-hover:rotate-12 transition-all" />
      </div>

      <h3 className="mt-6 font-display text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-slate-600 leading-relaxed">{desc}</p>

      <ul className="mt-5 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-sm text-slate-700">
            <span
              className={`mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${t.iconFg.replace("text-", "bg-")}`}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {visual && <div className="mt-6">{visual}</div>}
    </motion.div>
  );
};

export default Features;
