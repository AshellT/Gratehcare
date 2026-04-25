import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 12 }, (_, i) => 7 + i); // 7am - 6pm

type Shift = {
  day: number;
  start: number;
  duration: number;
  client: string;
  staff: string;
  color: string;
  status: "filled" | "open" | "tentative";
};

const shifts: Shift[] = [
  { day: 0, start: 8, duration: 2, client: "Eleanor R.", staff: "Priya", color: "indigo", status: "filled" },
  { day: 0, start: 11, duration: 1.5, client: "Marcus T.", staff: "Daniel", color: "sky", status: "filled" },
  { day: 0, start: 14, duration: 2, client: "Alana W.", staff: "James", color: "emerald", status: "filled" },
  { day: 1, start: 9, duration: 3, client: "Henry P.", staff: "Sara", color: "rose", status: "filled" },
  { day: 1, start: 13, duration: 2, client: "Eleanor R.", staff: "Priya", color: "indigo", status: "filled" },
  { day: 1, start: 16, duration: 1.5, client: "Maya K.", staff: "—", color: "amber", status: "open" },
  { day: 2, start: 8, duration: 2, client: "Eleanor R.", staff: "Daniel", color: "indigo", status: "filled" },
  { day: 2, start: 10.5, duration: 2, client: "Marcus T.", staff: "Tom", color: "sky", status: "tentative" },
  { day: 2, start: 14, duration: 1.5, client: "Alana W.", staff: "James", color: "emerald", status: "filled" },
  { day: 3, start: 9, duration: 2, client: "Henry P.", staff: "Sara", color: "rose", status: "filled" },
  { day: 3, start: 12, duration: 2, client: "Maya K.", staff: "—", color: "amber", status: "open" },
  { day: 4, start: 8, duration: 1.5, client: "Eleanor R.", staff: "Priya", color: "indigo", status: "filled" },
  { day: 4, start: 11, duration: 2.5, client: "Marcus T.", staff: "Daniel", color: "sky", status: "filled" },
  { day: 4, start: 15, duration: 2, client: "Henry P.", staff: "Sara", color: "rose", status: "filled" },
  { day: 5, start: 9, duration: 4, client: "Alana W.", staff: "James", color: "emerald", status: "filled" },
  { day: 6, start: 10, duration: 3, client: "Eleanor R.", staff: "—", color: "amber", status: "open" },
];

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-400 border-2 border-dashed border-amber-600",
};

const SchedulePage: React.FC = () => {
  const [selected, setSelected] = useState<Shift | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Schedule"
        description="Drag-and-drop rosters, fill shifts and avoid conflicts in real time."
        actions={[
          { label: "Filters", variant: "secondary", icon: <Filter className="h-4 w-4" /> },
          { label: "New shift", icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Shifts this week", value: "86", tone: "bg-indigo-50 text-indigo-700" },
          { label: "Open shifts", value: "12", tone: "bg-amber-50 text-amber-700" },
          { label: "Conflicts", value: "0", tone: "bg-emerald-50 text-emerald-700" },
          { label: "Coverage", value: "98%", tone: "bg-sky-50 text-sky-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            <div className={`mt-2 inline-flex font-display text-3xl font-bold rounded-lg px-2.5 py-1 ${s.tone}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <Card
        title="Week of Dec 2 – Dec 8"
        description="Filled · Open · Tentative"
        action={
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700">
              Today
            </button>
            <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50">
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-px bg-slate-200 rounded-t-xl overflow-hidden">
              <div className="bg-slate-50 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                Hour
              </div>
              {days.map((d, i) => (
                <div
                  key={d}
                  className="bg-slate-50 px-2 py-2 text-center"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {d}
                  </div>
                  <div className="font-display text-base font-bold text-slate-900">
                    {2 + i}
                  </div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="relative grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-px bg-slate-200">
              {hours.map((h) => (
                <React.Fragment key={h}>
                  <div className="bg-white text-[10px] font-semibold text-slate-400 text-right pr-2 pt-1 h-14">
                    {h.toString().padStart(2, "0")}:00
                  </div>
                  {days.map((d, di) => (
                    <div key={`${h}-${di}`} className="bg-white h-14 relative" />
                  ))}
                </React.Fragment>
              ))}

              {/* Shifts overlay */}
              {shifts.map((s, i) => {
                const top = (s.start - hours[0]) * 56;
                const height = s.duration * 56 - 4;
                const dayCol = `calc((100% - 60px) / 7 * ${s.day} + 60px)`;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelected(s)}
                    style={{
                      position: "absolute",
                      left: dayCol,
                      width: `calc((100% - 60px) / 7 - 4px)`,
                      top: `${top}px`,
                      height: `${height}px`,
                      marginLeft: "2px",
                    }}
                    className={`rounded-lg ${colorMap[s.color]} text-white text-left p-1.5 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                    data-testid={`schedule-shift-${i}`}
                  >
                    <div className="text-[10px] font-bold truncate">{s.client}</div>
                    <div className="text-[9px] opacity-90 truncate">
                      {s.staff} · {s.duration}h
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {selected && (
        <Card
          title={`${selected.client} · ${selected.duration}h`}
          description={`${days[selected.day]} ${selected.start.toString().padStart(2, "0")}:00`}
          action={
            <Badge
              tone={
                selected.status === "filled"
                  ? "emerald"
                  : selected.status === "open"
                    ? "amber"
                    : "indigo"
              }
              dot
            >
              {selected.status}
            </Badge>
          }
        >
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Staff</div>
              <div className="font-semibold text-slate-900">{selected.staff}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Service</div>
              <div className="font-semibold text-slate-900">Personal care</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Funding</div>
              <div className="font-semibold text-slate-900">NDIS · Plan-managed</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SchedulePage;
