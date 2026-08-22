import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import React from "react";

type ActionConfig = {
  label: string;
  onClick: () => void;
};

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode | ActionConfig;
  /** compact = smaller padding, used inside tables/cards */
  compact?: boolean;
};

const isActionConfig = (value: unknown): value is ActionConfig =>
  typeof value === "object" &&
  value !== null &&
  "label" in value &&
  "onClick" in value &&
  typeof (value as ActionConfig).onClick === "function" &&
  typeof (value as ActionConfig).label === "string";

const EmptyState: React.FC<Props> = ({
  icon,
  title,
  description,
  action,
  compact = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center text-center ${compact ? "py-10 px-4" : "py-20 px-6"}`}
    role="status"
    aria-label={title}
  >
    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
      {icon ?? <Inbox className="h-7 w-7" />}
    </div>
    <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
    {description && (
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">
        {description}
      </p>
    )}
    {action && (
      <div className="mt-5">
        {isActionConfig(action) ? (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {action.label}
          </button>
        ) : (
          action
        )}
      </div>
    )}
  </motion.div>
);

export default EmptyState;
