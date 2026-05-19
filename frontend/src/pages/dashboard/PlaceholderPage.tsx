import PageHeader from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Hammer } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const TIPS = [
  "All modules share a consistent data model — custom fields and tags carry across.",
  "GRATEHCARE AI analyses patterns across modules to surface insights automatically.",
  "Every action in GRATEHCARE is audit-logged with timestamp, user and change detail.",
  "Use the role switcher in the top bar to preview this page as a different role.",
];

const PlaceholderPage: React.FC<{
  title: string;
  eyebrow?: string;
  description?: string;
}> = ({ title, eyebrow, description }) => {
  const navigate = useNavigate();
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={[
          {
            label: "Back",
            variant: "secondary",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => navigate(-1),
          },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Coming soon card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="sm:col-span-2 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 text-center flex flex-col items-center justify-center shadow-sm"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-500 mb-4">
            <Hammer className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            {title} is coming soon
          </h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
            This module is actively in development. The data model, layouts and
            workflows for{" "}
            <strong className="font-semibold text-slate-700">{title}</strong>{" "}
            will appear here in an upcoming release.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate("/app")}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Return to dashboard
            </button>
            <button
              onClick={() => navigate("/app/messages")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Bell className="h-4 w-4" />
              Request early access
            </button>
          </div>
        </motion.div>

        {/* Did you know */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 flex flex-col justify-between"
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">
              Did you know?
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{tip}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-indigo-100">
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all platform capabilities →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
