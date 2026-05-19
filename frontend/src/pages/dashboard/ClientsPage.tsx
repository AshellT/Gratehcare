import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import { RowActionButton } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingState from "@/components/dashboard/LoadingState";
import PageHeader from "@/components/dashboard/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useClients } from "@/hooks/useClients";
import { Filter, Plus, Search, Users } from "lucide-react";
import React, { useState } from "react";

const ClientsPage: React.FC = () => {
  const [q, setQ] = useState("");
  const { toast } = useToast();
  const { data, loading, error } = useClients();
  const clients = data?.data ?? [];
  const filtered = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(q.toLowerCase()) ||
      (c.coordinator ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  if (loading) return <LoadingState rows={6} />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Clients"
        description="Every client, every plan, every visit — in one place."
        actions={[
          {
            label: "Filters",
            variant: "secondary",
            icon: <Filter className="h-4 w-4" />,
            onClick: () =>
              toast({
                tone: "info",
                title: "Client filters ready",
                message: "Use the search box to filter by client or coordinator.",
              }),
          },
          {
            label: "Add client",
            icon: <Plus className="h-4 w-4" />,
            onClick: () =>
              toast({ tone: "info", title: "Add client coming soon." }),
          },
        ]}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Could not load clients — showing demo data.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active clients",
            value: "184",
            change: "+3 this month",
            tone: "indigo",
          },
          {
            label: "Onboarding",
            value: "12",
            change: "4 completing soon",
            tone: "amber",
          },
          {
            label: "Avg. hours/wk",
            value: "21h",
            change: "+1.4h vs last month",
            tone: "sky",
          },
          {
            label: "Satisfaction",
            value: "4.9★",
            change: "Based on 142 reviews",
            tone: "emerald",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">
              {s.label}
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-slate-900">
              {s.value}
            </div>
            <div className="mt-1 text-xs text-slate-400">{s.change}</div>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or coordinator…"
              data-testid="clients-search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>{" "}
            of {clients.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={q ? "No clients match your search" : "No clients yet"}
            description={
              q
                ? `Try a different name or clear the search.`
                : "Add your first client to get started."
            }
            icon={<Users className="h-8 w-8" />}
            action={
              q
                ? { label: "Clear search", onClick: () => setQ("") }
                : {
                    label: "Add client",
                    onClick: () =>
                      toast({ tone: "info", title: "Add client coming soon." }),
                  }
            }
            compact
          />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="min-w-full" role="grid">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Funding</th>
                  <th className="px-5 py-3 hidden md:table-cell">
                    Coordinator
                  </th>
                  <th className="px-5 py-3 hidden lg:table-cell">Since</th>
                  <th className="px-5 py-3">Hours</th>
                  <th className="px-5 py-3 w-10" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    data-testid={`client-row-${c.initial}`}
                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() =>
                      toast({
                        tone: "info",
                        title: `${c.fullName}`,
                        message: "Client detail view coming soon.",
                      })
                    }
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br ${c.color ?? "from-indigo-500 to-sky-500"} text-white text-xs font-bold flex items-center justify-center`}
                        >
                          {c.initial}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {c.fullName}
                          </div>
                          <div className="text-xs text-slate-400">
                            #{c.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        tone={
                          c.status === "active"
                            ? "emerald"
                            : c.status === "onboarding"
                              ? "indigo"
                              : "slate"
                        }
                        dot
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 hidden sm:table-cell">
                      {c.funding}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 hidden md:table-cell">
                      {c.coordinator ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 hidden lg:table-cell">
                      {c.since}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                      {c.hoursPerWeek != null ? `${c.hoursPerWeek}h/wk` : "—"}
                    </td>
                    <td
                      className="px-5 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActionButton
                        label={`Actions for ${c.fullName}`}
                        onClick={() =>
                          toast({
                            tone: "info",
                            title: `${c.fullName}`,
                            message: "Actions menu coming soon.",
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClientsPage;
