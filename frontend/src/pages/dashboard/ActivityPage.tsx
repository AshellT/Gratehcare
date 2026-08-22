import React, { useEffect, useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { auditLogsApi } from "@/lib/api/audit-logs";

type ActivityEvent = {
  time: string;
  who: string;
  what: string;
  tenant: string;
  tone: string;
};

const ActivityPage: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const logs = await auditLogsApi.list({ limit: 50 });
        if (mounted && logs.data) {
          const mapped: ActivityEvent[] = logs.data.map((log: any) => ({
            time: new Date(log.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            who: log.user?.name || log.actor?.fullName || log.userId || "System",
            what: log.action || "Performed an action",
            tenant: log.tenant?.name || "Workspace",
            tone: "indigo",
          }));
          setEvents(mapped);
        }
      } catch (error) {
        console.error('Failed to load activity logs:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audit"
        title="Audit log"
        description="Every meaningful change in this workspace, newest first. This log is write-once — it is not edited from a form."
      />

      <Card>
        {loading ? (
          <div className="text-center py-8 text-sm text-slate-500">
            Loading activity...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No recent activity
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
};

export default ActivityPage;
