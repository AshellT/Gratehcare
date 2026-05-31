import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import PageHeader from "@/components/dashboard/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useActionQuery } from "@/hooks/useActionQuery";
import { rosteringApi } from "@/lib/api/rostering";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter, Loader2, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

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
  service?: string;
};

type RawShift = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  service?: string;
  client?: { fullName?: string };
  staff?: { user?: { fullName?: string }; title?: string };
};

const palette = ["indigo", "sky", "emerald", "rose", "amber"];

const weekStartForOffset = (weekOffset: number) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + weekOffset * 7);
  return start;
};

const formatWeekLabel = (weekStart: Date) => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(weekStart)} – ${fmt(end)}`;
};

const mapShift = (raw: RawShift, index: number, weekStart: Date): Shift | null => {
  const start = new Date(raw.startsAt);
  const end = new Date(raw.endsAt);
  const day = Math.floor((start.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
  if (day < 0 || day > 6) return null;

  const clientName = raw.client?.fullName ?? "Client";
  const shortClient = clientName
    .split(" ")
    .map((part) => `${part[0]}.`)
    .join(" ")
    .replace(/\.\s*\./, ".");

  return {
    day,
    start: start.getHours() + start.getMinutes() / 60,
    duration: Math.max(0.5, (end.getTime() - start.getTime()) / 3600000),
    client: shortClient,
    staff:
      raw.staff?.user?.fullName?.split(" ")[0] ??
      (raw.status === "OPEN" ? "—" : raw.staff?.title ?? "Staff"),
    color: palette[index % palette.length],
    status: raw.status === "OPEN" ? "open" : raw.status === "FILLED" ? "filled" : "tentative",
    service: raw.service,
  };
};

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-400 border-2 border-dashed border-amber-600",
};

const SchedulePage: React.FC = () => {
  const [selected, setSelected] = useState<Shift | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [rawShifts, setRawShifts] = useState<RawShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shiftTitle, setShiftTitle] = useState("");
  const { success, error, toast } = useToast();

  const weekStart = useMemo(() => weekStartForOffset(weekOffset), [weekOffset]);

  useActionQuery("create", () => setShowCreate(true));

  const loadShifts = async () => {
    const res = await rosteringApi.listShifts({ limit: 100 });
    setRawShifts((res.data ?? []) as unknown as RawShift[]);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await rosteringApi.listShifts({ limit: 100 });
        if (!mounted) return;
        setRawShifts((res.data ?? []) as unknown as RawShift[]);
      } catch {
        if (mounted) toast({ tone: "error", title: "Failed to load schedule shifts." });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const handleCreateShift = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shiftTitle.trim()) {
      error("Title required", "Enter a service or client name for the shift.");
      return;
    }
    setSaving(true);
    try {
      await rosteringApi.createShift(toTenantRecord(shiftTitle.trim(), "Scheduled from calendar") as any);
      success("Shift created");
      setShowCreate(false);
      setShiftTitle("");
      await loadShifts();
    } catch {
      error("Create failed", "Could not create shift.");
    } finally {
      setSaving(false);
    }
  };

  const shifts = useMemo(
    () =>
      rawShifts
        .map((shift, index) => mapShift(shift, index, weekStart))
        .filter((shift): shift is Shift => Boolean(shift)),
    [rawShifts, weekStart],
  );

  const stats = useMemo(() => {
    const open = shifts.filter((s) => s.status === "open").length;
    const filled = shifts.filter((s) => s.status === "filled").length;
    const coverage = shifts.length ? Math.round((filled / shifts.length) * 100) : 0;
    return [
      { label: "Shifts this week", value: String(shifts.length), tone: "bg-indigo-50 text-indigo-700" },
      { label: "Open shifts", value: String(open), tone: "bg-amber-50 text-amber-700" },
      { label: "Conflicts", value: "0", tone: "bg-emerald-50 text-emerald-700" },
      { label: "Coverage", value: `${coverage}%`, tone: "bg-sky-50 text-sky-700" },
    ];
  }, [shifts]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Schedule"
        description="Drag-and-drop rosters, fill shifts and avoid conflicts in real time."
        actions={[
          {
            label: "Filters",
            variant: "secondary",
            icon: <Filter className="h-4 w-4" />,
          },
          {
            label: "New shift",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">
              {s.label}
            </div>
            <div
              className={`mt-2 inline-flex font-display text-3xl font-bold rounded-lg px-2.5 py-1 ${s.tone}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <Card
        title={weekOffset === 0 ? `Week of ${formatWeekLabel(weekStart)}` : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset} · ${formatWeekLabel(weekStart)}`}
        description="Filled · Open · Tentative"
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((value) => value - 1)}
              aria-label="Previous week"
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() => {
                setWeekOffset(0);
                toast({
                  tone: "info",
                  title: "Returned to current demo week.",
                });
              }}
              className="h-8 px-3 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset((value) => value + 1)}
              aria-label="Next week"
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading schedule…
          </div>
        ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row */}
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-px bg-slate-200 rounded-t-xl overflow-hidden">
              <div className="bg-slate-50 px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                Hour
              </div>
              {days.map((d, i) => (
                <div key={d} className="bg-slate-50 px-2 py-2 text-center">
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
                    <div
                      key={`${h}-${di}`}
                      className="bg-white h-14 relative"
                    />
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
                    <div className="text-[10px] font-bold truncate">
                      {s.client}
                    </div>
                    <div className="text-[9px] opacity-90 truncate">
                      {s.staff} · {s.duration}h
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
        )}
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
              <div className="font-semibold text-slate-900">
                {selected.staff}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Service</div>
              <div className="font-semibold text-slate-900">{selected.service ?? "Personal care"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Funding</div>
              <div className="font-semibold text-slate-900">
                NDIS · Plan-managed
              </div>
            </div>
          </div>
        </Card>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New shift">
        <form onSubmit={handleCreateShift} className="space-y-4">
          <FormField label="Service / client">
            <input
              value={shiftTitle}
              onChange={(e) => setShiftTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create shift"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
