import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastTone = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
  duration?: number;
}

type ToastContextValue = {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Toast item styles ────────────────────────────────────────────────────────

const TONE_STYLES: Record<
  ToastTone,
  { bg: string; border: string; icon: React.ReactNode; titleColor: string }
> = {
  success: {
    bg: "bg-white",
    border: "border-l-4 border-l-emerald-500",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
    titleColor: "text-slate-900",
  },
  error: {
    bg: "bg-white",
    border: "border-l-4 border-l-rose-500",
    icon: <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />,
    titleColor: "text-slate-900",
  },
  warning: {
    bg: "bg-white",
    border: "border-l-4 border-l-amber-500",
    icon: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
    titleColor: "text-slate-900",
  },
  info: {
    bg: "bg-white",
    border: "border-l-4 border-l-indigo-500",
    icon: <Info className="h-5 w-5 text-indigo-500 flex-shrink-0" />,
    titleColor: "text-slate-900",
  },
};

// ─── Single toast item ────────────────────────────────────────────────────────

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const { bg, border, icon, titleColor } = TONE_STYLES[toast.tone];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 rounded-xl ${bg} ${border} px-4 py-3.5 shadow-lg border border-slate-200 w-full pointer-events-auto`}
      role="status"
      aria-live="polite"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (opts: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = opts.duration ?? 4000;
      setToasts((prev) => [...prev.slice(-4), { ...opts, id }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ tone: "success", title, message }),
    error: (title, message) => addToast({ tone: "error", title, message }),
    warning: (title, message) => addToast({ tone: "warning", title, message }),
    info: (title, message) => addToast({ tone: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[500] flex flex-col gap-2 w-80 sm:w-96 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
