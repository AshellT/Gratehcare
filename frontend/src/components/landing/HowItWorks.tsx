import React from "react";
import { motion } from "framer-motion";
import { Rocket, Workflow, TrendingUp } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: <Rocket className="h-6 w-6" />,
    title: "Set up in a day",
    desc: "Import staff, clients and existing schedules in minutes. Our team helps configure billing, compliance and care plans tailored to your services.",
    accent: "from-indigo-500 to-indigo-600",
  },
  {
    n: "02",
    icon: <Workflow className="h-6 w-6" />,
    title: "Manage with calm",
    desc: "Run shifts, log care notes, send invoices and keep credentials current — all from one connected workspace your whole team actually enjoys using.",
    accent: "from-sky-500 to-indigo-500",
  },
  {
    n: "03",
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Grow with insight",
    desc: "Use Lumina AI to forecast demand, plug claim leaks and unlock new services — confidently scaling without adding admin headcount.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section
      id="how"
      data-testid="how-it-works-section"
      className="py-24 lg:py-32 bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-slate opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            How it works
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Setup → Manage → Grow.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A clear path from your first roster to your hundredth hire — without
            ever outgrowing your tools.
          </p>
        </motion.div>

        <div className="mt-16 relative grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Connecting dashed line */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-px border-t-2 border-dashed border-slate-300"
          />

          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="relative rounded-3xl border border-slate-200 bg-white p-7 lg:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              data-testid={`how-step-${s.n}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-lg shadow-indigo-500/20`}
                >
                  {s.icon}
                </div>
                <div className="font-display text-3xl font-bold text-slate-200">
                  {s.n}
                </div>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
