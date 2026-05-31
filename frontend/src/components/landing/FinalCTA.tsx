import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { buildDemoPath } from "@/lib/signupPlan";

const FinalCTA: React.FC = () => {
  return (
    <section
      data-testid="final-cta-section"
      className="py-24 lg:py-32 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-16 lg:px-16 lg:py-24"
        >
          {/* Background ornaments */}
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-200"
              >
                The future of care is integrated
              </motion.span>
              <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Ready to transform how you manage care?
              </h2>
              <p className="mt-5 text-lg text-slate-300 max-w-2xl">
                Join thousands of care providers using GRATEHCARE to deliver better
                outcomes — for clients, families and the teams behind them.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                to="/register"
                data-testid="final-cta-primary"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-xl"
              >
                Start your free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={buildDemoPath({ source: "final-cta" })}
                data-testid="final-cta-secondary"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Book a personal demo
              </Link>
              <p className="text-xs text-slate-400 text-center mt-1">
                14-day free trial · No credit card · Cancel any time
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
