import React from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";

const regions = [
  { region: "Australia", tenants: 842, users: 11420, growth: "+18%", tone: "indigo" },
  { region: "New Zealand", tenants: 184, users: 2840, growth: "+12%", tone: "sky" },
  { region: "United Kingdom", tenants: 142, users: 2120, growth: "+9%", tone: "emerald" },
  { region: "United States", tenants: 84, users: 1280, growth: "+24%", tone: "amber" },
  { region: "Canada", tenants: 32, users: 760, growth: "+6%", tone: "rose" },
];

const NetworkPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Network"
        description="Where Lumina is delivering care today."
      />

      <Card>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stylised globe */}
          <div className="relative h-72 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56 rounded-full border border-white/20">
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-10 rounded-full border border-white/10" />
                {[
                  { x: 75, y: 30, label: "AU" },
                  { x: 70, y: 28, label: "NZ" },
                  { x: 30, y: 30, label: "UK" },
                  { x: 25, y: 38, label: "US" },
                  { x: 22, y: 30, label: "CA" },
                ].map((dot) => (
                  <div
                    key={dot.label}
                    className="absolute h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-indigo-400/30 animate-pulse"
                    style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                Lumina network
              </div>
              <div className="font-display text-2xl font-bold">1,284 tenants</div>
              <div className="text-xs text-slate-300">across 12 countries</div>
            </div>
          </div>

          <ul className="space-y-3">
            {regions.map((r) => (
              <li
                key={r.region}
                className="rounded-xl border border-slate-200 p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{r.region}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {r.tenants} tenants · {r.users.toLocaleString()} users
                  </div>
                </div>
                <div
                  className={`text-xs font-bold ${
                    r.tone === "indigo"
                      ? "text-indigo-700"
                      : r.tone === "sky"
                        ? "text-sky-700"
                        : r.tone === "emerald"
                          ? "text-emerald-700"
                          : r.tone === "amber"
                            ? "text-amber-700"
                            : "text-rose-700"
                  }`}
                >
                  {r.growth}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default NetworkPage;
