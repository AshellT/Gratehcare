import React from "react";
import { Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import StatCard from "@/components/dashboard/StatCard";
import { TrendingUp, Wallet, Users, Activity } from "lucide-react";

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Operational, financial and clinical analytics for the whole organisation."
        actions={[
          { label: "Last 90 days", variant: "secondary", icon: <Calendar className="h-4 w-4" /> },
          { label: "Export", icon: <Download className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value="$284,910" tone="emerald" icon={<Wallet className="h-5 w-5" />} delta={{ value: "+12%", direction: "up" }} index={0} />
        <StatCard label="Active clients" value="184" tone="indigo" icon={<Users className="h-5 w-5" />} delta={{ value: "+8", direction: "up" }} index={1} />
        <StatCard label="Visits delivered" value="2,841" tone="sky" icon={<Activity className="h-5 w-5" />} delta={{ value: "+9%", direction: "up" }} index={2} />
        <StatCard label="Outcomes met" value="87%" tone="amber" icon={<TrendingUp className="h-5 w-5" />} delta={{ value: "+5%", direction: "up" }} index={3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Revenue trend" description="Last 12 months" className="lg:col-span-2">
          <RevenueLineChart />
        </Card>
        <Card title="Service mix" description="By billable hours">
          <ServiceMixDonut />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Visits by service line" description="Last 30 days">
          <BarChart
            data={[
              { label: "Personal care", value: 920, tone: "indigo" },
              { label: "Domestic", value: 640, tone: "sky" },
              { label: "Community", value: 480, tone: "emerald" },
              { label: "Therapy", value: 320, tone: "amber" },
              { label: "Respite", value: 220, tone: "rose" },
            ]}
          />
        </Card>
        <Card title="Top performing staff" description="By NPS · last 30 days">
          <BarChart
            data={[
              { label: "Priya R.", value: 98, tone: "indigo" },
              { label: "Daniel W.", value: 92, tone: "sky" },
              { label: "Sara H.", value: 88, tone: "emerald" },
              { label: "Tom R.", value: 84, tone: "amber" },
              { label: "James M.", value: 78, tone: "rose" },
            ]}
            suffix="★"
          />
        </Card>
      </div>
    </div>
  );
};

const RevenueLineChart: React.FC = () => {
  const data = [42, 48, 55, 51, 62, 68, 72, 70, 78, 82, 88, 94];
  const max = Math.max(...data);
  return (
    <div className="h-64 w-full">
      <svg viewBox="0 0 600 220" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="reportGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100, 150, 200].map((y) => (
          <line key={y} x1="0" x2="600" y1={y + 10} y2={y + 10} stroke="#f1f5f9" />
        ))}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4 }}
          d={`M ${data
            .map((v, i) => `${(i / (data.length - 1)) * 600} ${210 - (v / max) * 190}`)
            .join(" L ")}`}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M 0 210 L ${data
            .map((v, i) => `${(i / (data.length - 1)) * 600} ${210 - (v / max) * 190}`)
            .join(" L ")} L 600 210 Z`}
          fill="url(#reportGrad)"
        />
      </svg>
    </div>
  );
};

const ServiceMixDonut: React.FC = () => {
  const segs = [
    { label: "Personal care", value: 38, color: "#4f46e5" },
    { label: "Domestic", value: 24, color: "#0ea5e9" },
    { label: "Community", value: 18, color: "#10b981" },
    { label: "Therapy", value: 12, color: "#f59e0b" },
    { label: "Respite", value: 8, color: "#f43f5e" },
  ];
  let acc = 0;
  return (
    <div>
      <div className="relative h-44 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90">
          {segs.map((s) => {
            const start = acc;
            acc += s.value;
            const dash = (s.value / 100) * 251.2;
            return (
              <circle
                key={s.label}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${251.2 - dash}`}
                strokeDashoffset={-((start / 100) * 251.2)}
              />
            );
          })}
        </svg>
        <div className="absolute text-center">
          <div className="font-display text-2xl font-bold text-slate-900">2,841</div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">visits</div>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {segs.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="text-slate-700">{s.label}</span>
            </div>
            <span className="font-semibold text-slate-900">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BarChart: React.FC<{
  data: { label: string; value: number; tone: string }[];
  suffix?: string;
}> = ({ data, suffix }) => {
  const max = Math.max(...data.map((d) => d.value));
  const tones: Record<string, string> = {
    indigo: "bg-indigo-500",
    sky: "bg-sky-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="font-semibold text-slate-900">
              {d.value}
              {suffix}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className={`h-full rounded-full ${tones[d.tone]}`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ReportsPage;
