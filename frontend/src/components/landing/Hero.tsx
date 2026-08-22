import React from "react";
import { motion, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getAppHomePath } from "@/lib/appHome";
import { buildDemoPath } from "@/lib/signupPlan";
import {
  ArrowRight,
  PlayCircle,
  CalendarCheck,
  Activity,
  Receipt,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: ((i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.6, ease: "easeOut" as const },
  })) as any,
};

const Hero: React.FC = () => {
  const { user } = useAuth();
  const primaryTo = user ? getAppHomePath(user.role) : "/register";
  const primaryLabel = user ? "Open workspace" : "Start Free Trial";

  return (
    <section
      data-testid="hero-section"
      className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid-slate [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-0 bg-radial-fade pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-6">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              data-testid="hero-badge"
            >
              <Sparkles className="h-3.5 w-3.5" />
              All-in-one care management, reimagined
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]"
            >
              Run Your Care Business{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                  Smarter
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 9 Q 50 2, 100 6 T 198 5"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              with GRATEHCARE
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              The all-in-one platform for scheduling, billing, compliance and care
              delivery — built for modern care providers who refuse to settle for
              clipboards, spreadsheets, and seven disconnected apps.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to={primaryTo}
                data-testid="hero-primary-cta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={buildDemoPath({ source: "hero" })}
                data-testid="hero-secondary-cta"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                <PlayCircle className="h-4 w-4 text-indigo-600" />
                Book a Demo
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={4}
              className="mt-8 flex items-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                HIPAA-ready
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-indigo-600" />
                14-day free trial
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-600" />
                No credit card
              </div>
            </motion.div>
          </div>

          {/* Right: Mock dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 relative"
            data-testid="hero-dashboard-mock"
          >
            <DashboardMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const DashboardMock: React.FC = () => {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-200/40 via-sky-200/40 to-transparent rounded-[2rem] blur-2xl" />

      {/* Main card */}
      <div className="relative rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 bg-slate-50/60">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xs font-medium text-slate-500">
            gratehcare.app / dashboard
          </div>
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400" />
        </div>

        <div className="grid grid-cols-12 gap-4 p-5">
          {/* Sidebar */}
          <div className="col-span-3 hidden md:flex flex-col gap-2">
            {["Today", "Schedule", "Clients", "Billing", "Compliance"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium ${
                    i === 0
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  {item}
                </div>
              ),
            )}
          </div>

          {/* Main panel */}
          <div className="col-span-12 md:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  Wednesday Overview
                </div>
                <div className="font-display text-lg font-bold text-slate-900">
                  Good morning, Maria
                </div>
              </div>
              <div className="text-[10px] text-slate-500">12 shifts today</div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                icon={<CalendarCheck className="h-3.5 w-3.5" />}
                label="Shifts filled"
                value="98%"
                trend="+4%"
                tone="indigo"
              />
              <MetricCard
                icon={<Receipt className="h-3.5 w-3.5" />}
                label="Claims approved"
                value="$42,180"
                trend="+12%"
                tone="emerald"
              />
              <MetricCard
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Care notes"
                value="316"
                trend="Today"
                tone="sky"
              />
            </div>

            {/* Schedule list */}
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-700">
                  Upcoming visits
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold">
                  See all
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: "Eleanor R.", time: "09:00", staff: "James", color: "bg-indigo-500" },
                  { name: "Marcus T.", time: "10:30", staff: "Priya", color: "bg-sky-500" },
                  { name: "Alana W.", time: "12:00", staff: "Daniel", color: "bg-emerald-500" },
                ].map((v) => (
                  <div
                    key={v.name}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-lg ${v.color} text-white flex items-center justify-center text-[10px] font-bold`}>
                        {v.name[0]}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-800">
                          {v.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          with {v.staff}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 bg-slate-100 rounded-full px-2 py-1">
                      {v.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating compliance badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute -left-4 sm:-left-8 bottom-12 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5"
      >
        <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Audit Ready
          </div>
          <div className="text-xs font-semibold text-slate-800">
            100% docs in place
          </div>
        </div>
      </motion.div>

      {/* Floating AI insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -right-3 sm:-right-6 -top-4 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 max-w-[220px]"
      >
        <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            AI Insight
          </div>
          <div className="text-xs font-semibold text-slate-800 leading-snug">
            3 shifts at risk — auto-suggest fill?
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  tone: "indigo" | "emerald" | "sky";
}> = ({ icon, label, value, trend, tone }) => {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div
          className={`inline-flex items-center justify-center h-6 w-6 rounded-md ${tones[tone]}`}
        >
          {icon}
        </div>
        <span className="text-[9px] font-semibold text-slate-500">
          {trend}
        </span>
      </div>
      <div className="mt-2 font-display text-lg font-bold text-slate-900">
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
};

export default Hero;
