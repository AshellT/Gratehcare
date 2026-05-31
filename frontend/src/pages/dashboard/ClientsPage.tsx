import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import FormField from "@/components/dashboard/FormField";
import { RowActionButton } from "@/components/dashboard/DataTable";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingState from "@/components/dashboard/LoadingState";
import PageHeader from "@/components/dashboard/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useActionQuery } from "@/hooks/useActionQuery";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/lib/api/types";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import { Filter, Plus, Search, Users, X } from "lucide-react";
import React, { useState } from "react";

const ClientsPage: React.FC = () => {
  const [q, setQ] = useState("");
  const { toast, success } = useToast();
  const { data, loading, error, create, update, remove, refetch } = useClients();
  const clients = data?.data ?? [];
  const filtered = clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(q.toLowerCase()) ||
      (c.coordinator ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [actionClient, setActionClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    funding: "NDIS",
    coordinator: "",
    status: "active" as Client["status"],
  });

  useActionQuery("create", () => setCreateOpen(true));

  const resetForm = () =>
    setForm({
      fullName: "",
      funding: "NDIS",
      coordinator: "",
      status: "active",
    });

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim()) {
      toast.warning("Name required", "Enter the client's full name.");
      return;
    }
    setSaving(true);
    try {
      await create(
        toTenantRecord(form.fullName.trim(), form.funding, {
          coordinator: form.coordinator.trim() || undefined,
          status: form.status.toUpperCase(),
        }) as Partial<Client>,
      );
      success("Client added", `${form.fullName.trim()} has been created.`);
      setCreateOpen(false);
      resetForm();
    } catch {
      toast.error("Create failed", "Could not add client. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (client: Client) => {
    if (!window.confirm(`Archive ${client.fullName}?`)) return;
    try {
      await remove(client.id);
      success("Client archived", `${client.fullName} has been archived.`);
      setActionClient(null);
      if (selected?.id === client.id) setSelected(null);
    } catch {
      toast.error("Archive failed", "Could not archive client.");
    }
  };

  const handleStatusChange = async (client: Client, status: Client["status"]) => {
    try {
      await update(client.id, {
        ...toTenantRecord(client.fullName, client.funding, {
          coordinator: client.coordinator,
          status: status.toUpperCase(),
        }),
      } as Partial<Client>);
      success("Status updated", `${client.fullName} is now ${status}.`);
      setActionClient(null);
      if (selected?.id === client.id) {
        setSelected({ ...client, status });
      }
      await refetch();
    } catch {
      toast.error("Update failed", "Could not update client status.");
    }
  };

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
            onClick: () => setCreateOpen(true),
          },
        ]}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Could not load clients from the backend.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active clients",
            value: String(clients.filter((c) => c.status === "active").length),
            change: `${clients.length} total`,
          },
          {
            label: "Onboarding",
            value: String(
              clients.filter((c) => c.status === "onboarding").length,
            ),
            change: "Awaiting setup",
          },
          {
            label: "Paused",
            value: String(clients.filter((c) => c.status === "paused").length),
            change: "Currently inactive",
          },
          {
            label: "High risk",
            value: String(clients.filter((c) => c.riskLevel === "high").length),
            change: "Needs review",
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
                ? "Try a different name or clear the search."
                : "Add your first client to get started."
            }
            icon={<Users className="h-8 w-8" />}
            action={
              q
                ? { label: "Clear search", onClick: () => setQ("") }
                : { label: "Add client", onClick: () => setCreateOpen(true) }
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
                    onClick={() => setSelected(c)}
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
                      className="px-5 py-3.5 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActionButton
                        label={`Actions for ${c.fullName}`}
                        onClick={() =>
                          setActionClient(actionClient?.id === c.id ? null : c)
                        }
                      />
                      {actionClient?.id === c.id && (
                        <div className="absolute right-5 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setSelected(c);
                              setActionClient(null);
                            }}
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() =>
                              void handleStatusChange(
                                c,
                                c.status === "active" ? "paused" : "active",
                              )
                            }
                          >
                            {c.status === "active" ? "Pause client" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                            onClick={() => void handleArchive(c)}
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Add client
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new client record for your organisation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <FormField
                label="Full name"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                required
              />
              <FormField
                label="Funding"
                value={form.funding}
                onChange={(e) =>
                  setForm((f) => ({ ...f, funding: e.target.value }))
                }
              />
              <FormField
                label="Coordinator"
                value={form.coordinator}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coordinator: e.target.value }))
                }
              />
              <label className="block text-sm font-semibold text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as Client["status"],
                    }))
                  }
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="paused">Paused</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    resetForm();
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Add client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/30">
          <button
            type="button"
            className="flex-1 cursor-default"
            aria-label="Close details"
            onClick={() => setSelected(null)}
          />
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Client record
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
                  {selected.fullName}
                </h2>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {selected.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <Badge
                tone={
                  selected.status === "active"
                    ? "emerald"
                    : selected.status === "onboarding"
                      ? "indigo"
                      : "slate"
                }
                dot
              >
                {selected.status}
              </Badge>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Funding", selected.funding],
                  ["Coordinator", selected.coordinator ?? "—"],
                  ["Since", selected.since],
                  [
                    "Hours / week",
                    selected.hoursPerWeek != null
                      ? `${selected.hoursPerWeek}h`
                      : "—",
                  ],
                  ["Risk", selected.riskLevel ?? "—"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="text-xs font-semibold text-slate-500">
                      {label}
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
