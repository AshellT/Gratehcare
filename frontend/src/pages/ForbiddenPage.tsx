import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/roles";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Mail, ShieldOff } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <motion.div
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
        role="main"
        aria-labelledby="forbidden-title"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center">
            <ShieldOff className="h-10 w-10 text-amber-500" />
          </div>
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
          403 Forbidden
        </div>
        <h1
          id="forbidden-title"
          className="font-display text-2xl font-bold text-slate-900"
        >
          Access restricted
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Your current role
          {user ? (
            <span className="inline-flex items-center mx-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {ROLE_LABELS[user.role]}
            </span>
          ) : (
            " "
          )}
          doesn't have permission to view this page. Contact your administrator
          if you think this is a mistake.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-left">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Need access?
          </div>
          <p className="text-sm text-slate-600">
            Ask your Organisation Owner or Admin to grant your role access to
            this area, or contact GRATEHCARE support.
          </p>
          <button
            onClick={() => navigate("/app/messages")}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Mail className="h-4 w-4" />
            Contact support
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForbiddenPage;
