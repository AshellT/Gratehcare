import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  hint?: string;
  icon?: React.ReactNode;
  tone?: "indigo" | "emerald" | "sky" | "amber" | "rose" | "slate";
  index?: number;
};

const toneMap: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-700",
};

const StatCard: React.FC<Props> = ({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "indigo",
  index = 0,
}) => {
  const TrendIcon =
    delta?.direction === "down"
      ? TrendingDown
      : delta?.direction === "up"
        ? TrendingUp
        : null;
  const trendColor =
    delta?.direction === "down"
      ? "text-rose-600 bg-rose-50"
      : delta?.direction === "up"
        ? "text-emerald-700 bg-emerald-50"
        : "text-slate-600 bg-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow"
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]}`}
          >
            {icon}
          </span>
        )}
        {delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${trendColor}`}
          >
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
        {value}
      </div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
      {hint && <div className="mt-2 text-[11px] text-slate-400">{hint}</div>}
    </motion.div>
  );
};

export default StatCard;
