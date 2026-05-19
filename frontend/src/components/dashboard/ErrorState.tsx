import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ServerCrash, WifiOff } from "lucide-react";
import React from "react";

type ErrorVariant = "generic" | "network" | "server" | "forbidden";

const VARIANTS: Record<
  ErrorVariant,
  { icon: React.ReactNode; title: string; hint: string; tone: string }
> = {
  generic: {
    icon: <AlertTriangle className="h-7 w-7" />,
    title: "Something went wrong",
    hint: "An unexpected error occurred. Try refreshing or come back later.",
    tone: "bg-amber-50 text-amber-600",
  },
  network: {
    icon: <WifiOff className="h-7 w-7" />,
    title: "Connection error",
    hint: "Could not reach the server. Check your internet connection and try again.",
    tone: "bg-slate-100 text-slate-500",
  },
  server: {
    icon: <ServerCrash className="h-7 w-7" />,
    title: "Server error",
    hint: "The server returned an unexpected response. Our team has been notified.",
    tone: "bg-rose-50 text-rose-600",
  },
  forbidden: {
    icon: <AlertTriangle className="h-7 w-7" />,
    title: "Access denied",
    hint: "You don't have permission to perform this action.",
    tone: "bg-amber-50 text-amber-600",
  },
};

type Props = {
  variant?: ErrorVariant;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

const ErrorState: React.FC<Props> = ({
  variant = "generic",
  message,
  onRetry,
  compact = false,
}) => {
  const v = VARIANTS[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center text-center ${compact ? "py-10 px-4" : "py-16 px-6"}`}
      role="alert"
    >
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 ${v.tone}`}
      >
        {v.icon}
      </div>
      <h3 className="font-display text-base font-bold text-slate-900">
        {v.title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">
        {message ?? v.hint}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </motion.div>
  );
};

export default ErrorState;
