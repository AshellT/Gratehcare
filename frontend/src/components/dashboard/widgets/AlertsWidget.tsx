import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ArrowRight } from "lucide-react";
import Card from "@/components/dashboard/Card";

export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description?: string;
  cta?: string;
  meta?: string;
};

const severityConfig: Record<
  Alert["severity"],
  { icon: React.ComponentType<{ className?: string }>; bg: string; fg: string; ring: string; label: string }
> = {
  critical: {
    icon: AlertCircle,
    bg: "bg-rose-50",
    fg: "text-rose-700",
    ring: "ring-rose-200",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    fg: "text-amber-700",
    ring: "ring-amber-200",
    label: "Warning",
  },
  info: {
    icon: Info,
    bg: "bg-indigo-50",
    fg: "text-indigo-700",
    ring: "ring-indigo-200",
    label: "Info",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Done",
  },
};

const AlertsWidget: React.FC<{
  title?: string;
  description?: string;
  alerts: Alert[];
  className?: string;
}> = ({ title = "Needs your attention", description, alerts, className }) => {
  return (
    <Card title={title} description={description} className={className}>
      {alerts.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-6">
          You're all clear ✨
        </div>
      ) : (
        <ul className="space-y-2.5">
          {alerts.map((a, i) => {
            const cfg = severityConfig[a.severity];
            const Icon = cfg.icon;
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                data-testid={`alert-${a.id}`}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors"
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${cfg.bg} ${cfg.fg} ring-4 ${cfg.ring} flex-shrink-0`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {a.title}
                    </div>
                    {a.meta && (
                      <div className="text-[10px] text-slate-400 flex-shrink-0">
                        {a.meta}
                      </div>
                    )}
                  </div>
                  {a.description && (
                    <div className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                      {a.description}
                    </div>
                  )}
                  {a.cta && (
                    <button className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                      {a.cta}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default AlertsWidget;
