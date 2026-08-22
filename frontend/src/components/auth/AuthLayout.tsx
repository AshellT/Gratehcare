import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";

type Props = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  side?: "left" | "right";
};

const AuthLayout: React.FC<Props> = ({
  children,
  title,
  subtitle,
  side = "left",
}) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Form side */}
      <div
        className={`flex flex-col justify-between p-8 sm:p-12 lg:p-16 ${
          side === "right" ? "lg:order-2" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            data-testid="auth-logo-link"
          >
            <img
              src="/logo-mark.svg"
              alt=""
              className="h-9 w-9 rounded-xl shadow-md shadow-indigo-500/20"
            />
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              GRATEHCARE
            </span>
          </Link>
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            data-testid="auth-back-link"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-12 max-w-md mx-auto w-full"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-slate-600">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </motion.div>

        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} GRATEHCARE Care, Inc. · HIPAA-ready · SOC 2 in
          progress
        </div>
      </div>

      {/* Visual side */}
      <div
        className={`relative hidden lg:flex items-center justify-center p-12 overflow-hidden bg-slate-900 ${
          side === "right" ? "lg:order-1" : ""
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-sky-600/20" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-10 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative max-w-md text-white"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Care, beautifully managed
          </span>
          <h2 className="mt-6 font-display text-3xl xl:text-4xl font-bold leading-tight">
            One platform for scheduling, billing, compliance and care delivery.
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Trusted by 2,400+ care teams across 12 countries to deliver better
            outcomes — for clients, families and the teams behind them.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { v: "98%", l: "Roster fill" },
              { v: "11d", l: "Faster claims" },
              { v: "4.9★", l: "Customer love" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="font-display text-2xl font-bold">{s.v}</div>
                <div className="text-[11px] text-slate-300 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
