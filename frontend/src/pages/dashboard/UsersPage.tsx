import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { usersApi } from "@/lib/api/users";
import { useToast } from "@/context/ToastContext";
import type { User } from "@/lib/api/types";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenant: string;
  status: "active" | "invited" | "disabled";
  color: string;
};

const statusTone = (status: UserRow["status"]) =>
  status === "active" ? "emerald" : status === "invited" ? "amber" : "slate";

const mapUser = (user: User): UserRow => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  role: (user.role as Role) || "org_owner",
  tenant: user.organizationId ?? "—",
  status:
    user.status === "pending"
      ? "invited"
      : user.status === "inactive"
        ? "disabled"
        : "active",
  color: user.avatarColor ? `from-[${user.avatarColor}]` : "from-indigo-500 to-sky-500",
});

const UsersPage: React.FC = () => {
  const toast = useToast();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await usersApi.list();
        if (!mounted) return;
        setRows((res.data ?? []).map(mapUser));
      } catch {
        if (mounted) {
          toast.error("Failed to load users", "Could not fetch users from backend.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.tenant.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const tenantCount = new Set(rows.map((u) => u.tenant).filter((t) => t !== "—")).size;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Users"
        description="Every user across every tenant on GRATEHCARE."
        actions={[
          {
            label: "Invite user",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => {
              setInviteOpen(true);
              notify("Invite user workflow opened.");
            },
          },
        ]}
      />

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

      {inviteOpen && (
        <Card title="Invite user" description="Create an invitation for a platform or tenant user.">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
            <input
              placeholder="Full name"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="Email address"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option>Super Admin</option>
              <option>Platform Support</option>
              <option>Organization Owner</option>
              <option>Operations Admin</option>
            </select>
            <button
              onClick={() => {
                setInviteOpen(false);
                notify("User invitation queued.");
              }}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Send invite
            </button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
            />
          </div>
          <div className="text-xs text-slate-500">
            {loading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-semibold text-slate-900">{rows.length}</span> users
                {tenantCount > 0 && <> across {tenantCount} tenants</>}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No users yet</div>
            <p className="mt-1 text-sm text-slate-500">Invite users or seed test accounts from the backend.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Tenant</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-xs font-bold flex items-center justify-center">
                          {u.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="indigo">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{u.tenant}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(u.status)} dot>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => notify(`${u.name} user actions opened.`)}
                        aria-label={`Open actions for ${u.name}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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

export default UsersPage;
