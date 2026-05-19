import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/roles";
import { motion } from "framer-motion";
import { ArrowLeft, Home, ShieldOff } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const AccessDenied: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[70vh] flex items-center justify-center px-4"
      role="alert"
      aria-label="Access denied"
    >
      <div className="max-w-sm w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-4">
          <ShieldOff className="h-7 w-7" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
          Access restricted
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          You can't view this page
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Your role
          {user && (
            <span className="inline-flex items-center mx-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {ROLE_LABELS[user.role]}
            </span>
          )}
          doesn't have permission to view this section. Use the sidebar to
          navigate to your available pages.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors w-full"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessDenied;
