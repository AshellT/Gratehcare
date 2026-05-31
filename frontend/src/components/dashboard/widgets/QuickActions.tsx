import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/dashboard/Card";
import { useAppAction } from "@/hooks/useAppAction";
import { useWriteAccess } from "@/context/SubscriptionContext";

export type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  tone?: "indigo" | "emerald" | "sky" | "amber" | "rose" | "violet" | "slate";
};

const tones: Record<NonNullable<QuickAction["tone"]>, string> = {
  indigo: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 hover:bg-sky-100 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-rose-100",
  violet: "bg-violet-50 text-violet-700 hover:bg-violet-100 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 hover:bg-slate-200 ring-slate-200",
};

const QuickActions: React.FC<{
  title?: string;
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}> = ({ title = "Quick actions", actions, columns = 2 }) => {
  const { runAction: runAppAction } = useAppAction();
  const canWrite = useWriteAccess();
  const colClass =
    columns === 4 ? "grid-cols-4" : columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <Card title={title}>
      <div className={`grid ${colClass} gap-2.5`}>
        {actions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => canWrite && runAppAction(a.label, a.onClick)}
            disabled={!canWrite}
            data-testid={`quick-action-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={`group flex flex-col items-start gap-2 rounded-xl p-3.5 text-left transition-all ring-1 ${
              tones[a.tone || "indigo"]
            } ${!canWrite ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 group-hover:scale-110 transition-transform">
              {a.icon}
            </span>
            <span className="text-xs font-semibold leading-tight">{a.label}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
