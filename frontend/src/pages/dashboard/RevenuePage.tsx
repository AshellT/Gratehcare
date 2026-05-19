import React from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import { Wallet, TrendingUp, Users, Activity } from "lucide-react";

const RevenuePage: React.FC = () => {
  const data = [142, 158, 168, 184, 210, 224, 248, 256, 272, 284, 296, 318];
  const max = Math.max(...data);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Revenue"
        description="MRR, ARR, expansion and churn — across the entire GRATEHCARE network."
        actions={[{ label: "Export", icon: <Download className="h-4 w-4" /> }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MRR" value="$284,910" tone="indigo" icon={<Wallet className="h-5 w-5" />} delta={{ value: "+12%", direction: "up" }} index={0} />
        <StatCard label="ARR" value="$3.42M" tone="emerald" icon={<TrendingUp className="h-5 w-5" />} delta={{ value: "+18%", direction: "up" }} index={1} />
        <StatCard label="Active tenants" value="1,284" tone="sky" icon={<Users className="h-5 w-5" />} delta={{ value: "+42", direction: "up" }} index={2} />
        <StatCard label="Net retention" value="118%" tone="amber" icon={<Activity className="h-5 w-5" />} delta={{ value: "+3%", direction: "up" }} index={3} />
      </div>

      <Card title="MRR · last 12 months" description="Indigo line shows trend; gradient is volume.">
        <div className="h-72 w-full">
          <svg viewBox="0 0 600 240" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revBig" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 60, 120, 180].map((y) => (
              <line key={y} x1="0" x2="600" y1={y + 10} y2={y + 10} stroke="#f1f5f9" />
            ))}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4 }}
              d={`M ${data
                .map((v, i) => `${(i / (data.length - 1)) * 600} ${230 - (v / max) * 210}`)
                .join(" L ")}`}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={`M 0 230 L ${data
                .map((v, i) => `${(i / (data.length - 1)) * 600} ${230 - (v / max) * 210}`)
                .join(" L ")} L 600 230 Z`}
              fill="url(#revBig)"
            />
          </svg>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Revenue by plan">
          <ul className="space-y-3">
            {[
              { plan: "Enterprise", value: "$184,200", pct: 64, tone: "bg-violet-500" },
              { plan: "Growth", value: "$78,420", pct: 27, tone: "bg-indigo-500" },
              { plan: "Starter", value: "$22,290", pct: 9, tone: "bg-sky-500" },
            ].map((p) => (
              <li key={p.plan}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-800">{p.plan}</span>
                  <span className="font-semibold text-slate-900">{p.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${p.tone}`} style={{ width: `${p.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Cohort retention">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 49 }).map((_, i) => {
              const intensity = Math.max(20, 100 - Math.floor((i % 7) * 9) - Math.floor(i / 7) * 4);
              return (
                <div
                  key={i}
                  className="aspect-square rounded"
                  style={{
                    background: `rgba(79, 70, 229, ${intensity / 100})`,
                  }}
                  title={`${intensity}%`}
                />
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <span>Newer</span>
            <span>Older cohorts →</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
