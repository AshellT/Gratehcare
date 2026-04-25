import React from "react";

type Tone = "emerald" | "amber" | "rose" | "indigo" | "sky" | "slate" | "violet";

const tones: Record<Tone, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
};

const Badge: React.FC<{
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}> = ({ children, tone = "slate", dot }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
  >
    {dot && (
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "emerald"
            ? "bg-emerald-500"
            : tone === "amber"
              ? "bg-amber-500"
              : tone === "rose"
                ? "bg-rose-500"
                : tone === "sky"
                  ? "bg-sky-500"
                  : tone === "violet"
                    ? "bg-violet-500"
                    : "bg-slate-500"
        }`}
      />
    )}
    {children}
  </span>
);

export default Badge;
