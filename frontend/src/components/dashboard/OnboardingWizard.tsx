import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  ChevronRight,
  FileCheck,
  HeartPulse,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "gratehcare.onboarding.complete";

type Step = {
  id: number;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    icon: <HeartPulse className="h-8 w-8 text-indigo-600" />,
    eyebrow: "Welcome to GRATEHCARE",
    title: "Your care platform is ready",
    body: "This is your demo workspace. All data shown here is sample data and safe to explore. Role-switching, live updates and all features are enabled.",
    cta: "Get started",
  },
  {
    id: 2,
    icon: <Building2 className="h-8 w-8 text-indigo-600" />,
    eyebrow: "Your organisation",
    title: "Set up your workspace",
    body: "Customise your organisation name, logo and contact details in Settings → Organisation. Your NDIS provider number and ABN can be added there too.",
    cta: "Next",
  },
  {
    id: 3,
    icon: <Users className="h-8 w-8 text-indigo-600" />,
    eyebrow: "Your team",
    title: "Invite staff and coordinators",
    body: "Add support workers, care coordinators and admin staff from the Staff module. Each person gets role-appropriate access automatically.",
    cta: "Next",
  },
  {
    id: 4,
    icon: <FileCheck className="h-8 w-8 text-indigo-600" />,
    eyebrow: "Compliance & NDIS",
    title: "Stay ahead of compliance",
    body: "GRATEHCARE tracks staff credentials, expiry dates and incident reporting for you. Set up compliance templates once and get automated reminders.",
    cta: "Next",
  },
  {
    id: 5,
    icon: <Sparkles className="h-8 w-8 text-indigo-600" />,
    eyebrow: "AI insights",
    title: "Let GRATEHCARE AI work for you",
    body: "GRATEHCARE Pro and Elite include AI care insights, roster optimisation, billing anomaly detection and compliance risk scoring — all built in.",
    cta: "Start exploring",
  },
];

// ─── Progress dots ────────────────────────────────────────────────────────────
const Dots: React.FC<{ total: number; current: number }> = ({
  total,
  current,
}) => (
  <div className="flex items-center justify-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <motion.span
        key={i}
        animate={{
          width: i === current ? 20 : 6,
          opacity: i <= current ? 1 : 0.3,
        }}
        transition={{ duration: 0.25 }}
        className={`h-1.5 rounded-full ${i <= current ? "bg-indigo-600" : "bg-slate-200"}`}
      />
    ))}
  </div>
);

// ─── Wizard modal ─────────────────────────────────────────────────────────────
const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Only show on first visit (per user)
    const key = `${STORAGE_KEY}_${user?.id ?? "guest"}`;
    if (!localStorage.getItem(key)) {
      // Delay to let the page settle
      const timer = window.setTimeout(() => setOpen(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [user?.id]);

  const dismiss = () => {
    const key = `${STORAGE_KEY}_${user?.id ?? "guest"}`;
    localStorage.setItem(key, "1");
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden">
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center">
                    <HeartPulse
                      className="h-4 w-4 text-white"
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="font-display text-sm font-bold text-slate-900">
                    GRATEHCARE
                  </span>
                </div>
                <button
                  onClick={dismiss}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close onboarding"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Step content */}
              <div className="px-6 pb-4 min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Icon */}
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                      {current.icon}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
                      {current.eyebrow}
                    </div>
                    <h2
                      id="onboarding-title"
                      className="font-display text-xl font-bold text-slate-900"
                    >
                      {current.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {current.body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
                <Dots total={STEPS.length} current={step} />

                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                  >
                    {step === STEPS.length - 1 ? (
                      <>
                        <Check className="h-4 w-4" /> {current.cta}
                      </>
                    ) : (
                      <>
                        {current.cta} <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingWizard;
