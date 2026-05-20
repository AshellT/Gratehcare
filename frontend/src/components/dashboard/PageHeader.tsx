import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAppAction } from "@/hooks/useAppAction";
import { canUseActionForPath } from "@/lib/permissions";

type Action = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: Action[];
};

const PageHeader: React.FC<Props> = ({ eyebrow, title, description, actions }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { runAction: runAppAction } = useAppAction();
  const visibleActions = (actions || []).filter((action) =>
    canUseActionForPath(user?.role, location.pathname, action.label),
  );

  const runAction = (action: Action) => {
    runAppAction(action.label, action.onClick);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-200"
    >
      <div>
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">{description}</p>
        )}
      </div>
      {visibleActions.length > 0 && (
        <div className="flex items-center gap-2">
          {visibleActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => runAction(a)}
              data-testid={`pageheader-action-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                a.variant === "secondary"
                  ? "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;
