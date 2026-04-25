import React from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Settings2,
  Users,
  HandHeart,
  Wallet,
  ShieldCheck,
  HomeIcon,
  Stethoscope,
} from "lucide-react";

const roles = [
  {
    icon: <Crown className="h-5 w-5" />,
    title: "Owners",
    desc: "Real-time P&L, growth metrics and strategic insights — without spreadsheets.",
    tone: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: <Settings2 className="h-5 w-5" />,
    title: "Admins",
    desc: "Run the engine: settings, integrations, users, permissions and policies.",
    tone: "text-slate-700 bg-slate-100",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Coordinators",
    desc: "Build rosters, fill shifts and orchestrate care across clients & teams.",
    tone: "text-sky-600 bg-sky-50",
  },
  {
    icon: <HandHeart className="h-5 w-5" />,
    title: "Support Workers",
    desc: "Mobile-first shifts, care notes, kilometres and timesheets in one tap.",
    tone: "text-rose-600 bg-rose-50",
  },
  {
    icon: <Wallet className="h-5 w-5" />,
    title: "Billing",
    desc: "Generate invoices, lodge claims and reconcile payments with precision.",
    tone: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Compliance",
    desc: "Live credential dashboards, incident workflows and audit-ready exports.",
    tone: "text-amber-700 bg-amber-50",
  },
  {
    icon: <HomeIcon className="h-5 w-5" />,
    title: "Families",
    desc: "A calm portal for updates, schedules and messages — no app fatigue.",
    tone: "text-fuchsia-600 bg-fuchsia-50",
  },
  {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Practitioners",
    desc: "Allied health and clinicians collaborate on plans, goals and outcomes.",
    tone: "text-teal-600 bg-teal-50",
  },
];

const RoleBased: React.FC = () => {
  return (
    <section
      id="roles"
      data-testid="roles-section"
      className="py-24 lg:py-32 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Built for every seat at the table
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            One platform. Eight roles. Zero friction.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Lumina adapts to who you are — owner, coordinator, support worker or
            family member — with focused workspaces and the right level of
            access.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              data-testid={`role-card-${r.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${r.tone}`}
              >
                {r.icon}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
                {r.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {r.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleBased;
