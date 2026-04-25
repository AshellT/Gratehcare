import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const problems = [
  "Schedules built in spreadsheets — broken every Monday",
  "Compliance docs scattered across drives, inboxes, and drawers",
  "Claim rejections you discover weeks too late",
  "Care notes locked on a single device, far from the team",
  "Five tools that don't talk to each other (and one that costs a fortune)",
];

const solutions = [
  "Drag-and-drop rosters with smart conflict detection",
  "Audit-ready compliance vault, always one click away",
  "Real-time claim tracking and proactive error catching",
  "Mobile care notes that sync the moment you tap save",
  "One platform. One source of truth. Every team in sync.",
];

const ProblemSolution: React.FC = () => {
  return (
    <section
      id="problem"
      data-testid="problem-solution-section"
      className="py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            The status quo is broken
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Care teams deserve better tools.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            You went into care to help people — not to wrestle paperwork. Lumina
            replaces the chaos with one calm, connected system.
          </p>
        </motion.div>

        <div className="mt-14 grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Problem column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-rose-200/70 bg-rose-50/40 p-8 lg:p-10"
            data-testid="problem-card"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <X className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-rose-700">
                  The Old Way
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Without Lumina
                </h3>
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex gap-3 text-slate-700">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-base leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-8 lg:p-10 shadow-lg shadow-indigo-500/5"
            data-testid="solution-card"
          >
            <div className="absolute top-5 right-5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              The Lumina Way
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                  With Lumina
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Calm, connected, audit-ready
                </h3>
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex gap-3 text-slate-800">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-base leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
