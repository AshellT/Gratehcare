import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  HandHeart,
  MessageSquare,
  Folder,
  Receipt,
  Heart,
  Loader2,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import Card from "@/components/dashboard/Card";
import { careApi } from "@/lib/api/care";
import { rosteringApi } from "@/lib/api/rostering";
import { useNavigate } from "react-router-dom";

type RawNote = {
  id: string;
  title?: string;
  body?: string;
  content?: string;
  createdAt: string;
  clientName?: string;
  workerName?: string;
  client?: { fullName?: string };
  staff?: { user?: { fullName?: string } };
};

type RawShift = {
  id: string;
  startsAt?: string;
  startTime?: string;
  clientName?: string;
  client?: { fullName?: string };
  status?: string;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const FamilyHome: React.FC = () => {
  const [notes, setNotes] = useState<RawNote[]>([]);
  const [shifts, setShifts] = useState<RawShift[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [notesRes, shiftsRes] = await Promise.all([
          careApi.listNotes({ limit: 8 }),
          rosteringApi.listShifts({ limit: 12 }),
        ]);
        if (!mounted) return;
        setNotes((notesRes.data ?? []) as unknown as RawNote[]);
        setShifts((shiftsRes.data ?? []) as unknown as RawShift[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const clientName = useMemo(() => {
    const fromNote = notes[0]?.clientName ?? notes[0]?.client?.fullName;
    const fromShift = shifts[0]?.clientName ?? shifts[0]?.client?.fullName;
    return fromNote || fromShift || "Your loved one";
  }, [notes, shifts]);

  const latestNote = notes[0];
  const visitItems = useMemo(
    () =>
      shifts.slice(0, 5).map((shift) => {
        const when = shift.startsAt || shift.startTime;
        return {
          id: shift.id,
          primary: shift.clientName ?? shift.client?.fullName ?? "Visit",
          meta: when ? new Date(when).toLocaleString() : "Scheduled",
          badge: {
            label: (shift.status ?? "scheduled").toLowerCase(),
            tone: "indigo" as const,
          },
        };
      }),
    [shifts],
  );

  const noteAlerts = useMemo(
    () =>
      notes.slice(0, 4).map((note) => ({
        id: note.id,
        title: note.title || "Care note",
        description: note.body || note.content || "",
        severity: "info" as const,
      })),
    [notes],
  );

  const activityItems = useMemo(
    () =>
      notes.slice(0, 6).map((note) => ({
        id: note.id,
        who: note.workerName ?? note.staff?.user?.fullName ?? "Care team",
        what: note.body || note.content || note.title || "Care update",
        when: timeAgo(note.createdAt),
      })),
    [notes],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading family portal…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RoleGreeting
        actions={[
          { label: "Documents", variant: "secondary", icon: <Folder className="h-4 w-4" />, onClick: () => navigate("/app/family-documents") },
          { label: "Message care team", icon: <MessageSquare className="h-4 w-4" />, onClick: () => navigate("/app/family-messages") },
        ]}
      />

      <KpiGrid
        items={[
          { label: "Upcoming visits", value: String(shifts.length), tone: "indigo" },
          { label: "Shared notes", value: String(notes.length), tone: "emerald" },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <WorkQueue
          className="lg:col-span-2"
          title={`${clientName}'s care this week`}
          description="Past and upcoming visits from the roster"
          items={visitItems}
        />

        <Card title="Latest update from the team" icon={<HandHeart className="h-4 w-4" />}>
          {latestNote ? (
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {(latestNote.workerName ?? latestNote.staff?.user?.fullName ?? "Care")
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                {latestNote.workerName ?? latestNote.staff?.user?.fullName ?? "Care team"} ·{" "}
                {timeAgo(latestNote.createdAt)}
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                &ldquo;{latestNote.body || latestNote.content}&rdquo;
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No shared care notes yet.</p>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <QuickActions
          actions={[
            { label: "Message team", icon: <MessageSquare className="h-4 w-4" />, tone: "indigo", onClick: () => navigate("/app/family-messages") },
            { label: "Care plan", icon: <Heart className="h-4 w-4" />, tone: "rose", onClick: () => navigate("/app/family-care-notes") },
            { label: "Schedule", icon: <CalendarCheck className="h-4 w-4" />, tone: "sky", onClick: () => navigate("/app/family-upcoming-visits") },
            { label: "Documents", icon: <Folder className="h-4 w-4" />, tone: "amber", onClick: () => navigate("/app/family-documents") },
            { label: "Billing", icon: <Receipt className="h-4 w-4" />, tone: "emerald", onClick: () => navigate("/app/family-billing") },
          ]}
          columns={3}
        />

        <AlertsWidget
          className="lg:col-span-2"
          title="Notes from this week"
          alerts={noteAlerts}
        />
      </div>

      <ActivityFeed
        title="Care log"
        description={`Recent updates about ${clientName}`}
        items={activityItems}
      />
    </div>
  );
};

export default FamilyHome;
