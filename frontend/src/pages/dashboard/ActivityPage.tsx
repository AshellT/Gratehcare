import React from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

const events = [
  { time: "10:42", who: "Maria Lopez", what: "Updated care plan for Eleanor Rivers", tenant: "Meridian", tone: "indigo" },
  { time: "10:38", who: "system", what: "Auto-filled 3 night shifts via Lumina AI", tenant: "Meridian", tone: "violet" },
  { time: "10:21", who: "Priya Raman", what: "Logged care note for Eleanor Rivers", tenant: "Meridian", tone: "indigo" },
  { time: "10:14", who: "Daniel Wu", what: "Submitted claim CL-2189 ($1,420)", tenant: "Meridian", tone: "emerald" },
  { time: "09:58", who: "system", what: "Reminder sent: First aid expiring (James M.)", tenant: "Meridian", tone: "amber" },
  { time: "09:42", who: "James Okafor", what: "Closed incident INC-477 (Near miss)", tenant: "Aurora", tone: "emerald" },
  { time: "09:18", who: "Sara Hill", what: "Created 4 new shifts for next week", tenant: "Northwind", tone: "sky" },
  { time: "08:54", who: "system", what: "Daily roster summary delivered", tenant: "All", tone: "slate" },
];

const ActivityPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audit"
        title="Activity"
        description="Every meaningful action across your organisation, in real time."
      />

      <Card>
        <ol className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-6">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[34px] top-0 h-4 w-4 rounded-full border-2 border-white ring-2 ${
                  e.tone === "indigo"
                    ? "ring-indigo-500 bg-indigo-500"
                    : e.tone === "violet"
                      ? "ring-violet-500 bg-violet-500"
                      : e.tone === "emerald"
                        ? "ring-emerald-500 bg-emerald-500"
                        : e.tone === "amber"
                          ? "ring-amber-500 bg-amber-500"
                          : e.tone === "sky"
                            ? "ring-sky-500 bg-sky-500"
                            : "ring-slate-400 bg-slate-400"
                }`}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    <span className="text-slate-500">{e.who}</span>{" "}
                    <span>{e.what}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <Badge tone="slate">{e.tenant}</Badge>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400">{e.time}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};

export default ActivityPage;
