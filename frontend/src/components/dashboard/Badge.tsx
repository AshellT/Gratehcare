import React from "react";

export type BadgeTone =
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "sky"
  | "slate"
  | "violet"
  | "orange"
  | "cyan"
  | "lime";

const tones: Record<BadgeTone, { pill: string; dot: string }> = {
  emerald: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  amber: {
    pill: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  rose: {
    pill: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  indigo: {
    pill: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  sky: { pill: "bg-sky-100 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  slate: {
    pill: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
  violet: {
    pill: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  orange: {
    pill: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  cyan: {
    pill: "bg-cyan-100 text-cyan-700 border-cyan-200",
    dot: "bg-cyan-500",
  },
  lime: {
    pill: "bg-lime-100 text-lime-700 border-lime-200",
    dot: "bg-lime-500",
  },
};

const Badge: React.FC<{
  children: React.ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}> = ({ children, tone = "slate", dot, className = "" }) => {
  const t = tones[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${t.pill} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${t.dot}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
