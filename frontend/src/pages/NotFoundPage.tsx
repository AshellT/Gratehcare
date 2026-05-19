import { motion } from "framer-motion";
import { ArrowLeft, HeartPulse, Home } from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <motion.div
        id="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
        </div>

        {/* 404 number */}
        <div className="font-display text-[96px] font-bold leading-none tracking-tighter text-slate-900 select-none">
          <span className="text-indigo-200">4</span>
          <span className="bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            0
          </span>
          <span className="text-indigo-200">4</span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          The page at{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
            {location.pathname}
          </code>{" "}
          doesn't exist. It may have been moved, deleted, or you may have typed
          the URL incorrectly.
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
            Back to dashboard
          </button>
        </div>

        {/* Help links */}
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400 mb-3">
            Looking for one of these?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: "Dashboard", to: "/app" },
              { label: "Clients", to: "/app/clients" },
              { label: "Rostering", to: "/app/rostering" },
              { label: "Compliance", to: "/app/compliance-overview" },
              { label: "Reports", to: "/app/reports" },
              { label: "Settings", to: "/app/settings" },
            ].map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
