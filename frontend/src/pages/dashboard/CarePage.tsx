import React from "react";
import { Plus, FileText, Target, Activity } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

const goals = [
  { title: "Maintain mobility with daily walks", progress: 72, status: "on-track" },
  { title: "Improve hand strength via OT exercises", progress: 48, status: "on-track" },
  { title: "Achieve restful sleep 6/7 nights", progress: 86, status: "on-track" },
  { title: "Stable nutrition with weekly meal plan", progress: 92, status: "exceeded" },
];

const notes = [
  { author: "Priya Raman", role: "Coordinator", time: "12 min ago", text: "Eleanor was in great spirits today. Walk in the garden completed. Lunch eaten in full." },
  { author: "Daniel Wu", role: "Support worker", time: "Yesterday", text: "Morning visit. Medications administered. No concerns." },
  { author: "Dr. Raj Patel", role: "Physiotherapist", time: "2 days ago", text: "Reviewed exercise plan. Increased resistance on band work. Will reassess in 4 weeks." },
];

const CarePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Care plans"
        description="Living care plans, goals and outcomes for every client."
        actions={[
          { label: "Templates", variant: "secondary", icon: <FileText className="h-4 w-4" /> },
          { label: "New care plan", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Eleanor Rivers · Active care plan" description="v3.2 · Last reviewed 12 days ago">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-lg font-bold flex items-center justify-center">
              ER
            </div>
            <div>
              <div className="font-display text-lg font-bold text-slate-900">
                Eleanor Rivers · 78
              </div>
              <div className="text-sm text-slate-500">
                Diagnosis: Parkinson&apos;s · Mild cognitive decline
              </div>
            </div>
            <Badge tone="emerald" dot>
              Active
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Goals & outcomes
            </div>
            {goals.map((g) => (
              <div
                key={g.title}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">{g.title}</div>
                  <Badge tone={g.status === "exceeded" ? "emerald" : "indigo"}>{g.progress}%</Badge>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      g.status === "exceeded" ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vitals trend" description="Last 14 days" icon={<Activity className="h-4 w-4" />}>
          <div className="space-y-4">
            {[
              { label: "Blood pressure", value: "128/82", trend: "Stable", tone: "emerald" },
              { label: "Resting heart rate", value: "72 bpm", trend: "+2 bpm", tone: "amber" },
              { label: "Sleep quality", value: "7.2 / 10", trend: "+0.4", tone: "emerald" },
              { label: "Appetite", value: "Good", trend: "Stable", tone: "emerald" },
            ].map((v) => (
              <div
                key={v.label}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <div className="text-xs text-slate-500">{v.label}</div>
                  <div className="text-sm font-semibold text-slate-900">{v.value}</div>
                </div>
                <Badge tone={v.tone as any}>{v.trend}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent care notes" description="From the team this week">
        <ul className="space-y-4">
          {notes.map((n) => (
            <li key={n.time} className="rounded-xl border border-slate-200 p-4 hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-xs font-bold flex items-center justify-center">
                    {n.author
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{n.author}</div>
                    <div className="text-[10px] text-slate-500">
                      {n.role} · {n.time}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{n.text}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default CarePage;
