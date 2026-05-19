import React, { useState } from "react";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { ROLE_LABELS, type Role } from "@/lib/roles";

const users: { name: string; email: string; role: Role; tenant: string; status: "active" | "invited" | "disabled"; lastActive: string; color: string }[] = [
  { name: "Maria Lopez", email: "maria@meridian.care", role: "org_owner", tenant: "Meridian Home Care", status: "active", lastActive: "2m ago", color: "from-indigo-500 to-sky-500" },
  { name: "Priya Raman", email: "priya@meridian.care", role: "care_coordinator", tenant: "Meridian Home Care", status: "active", lastActive: "12m ago", color: "from-rose-500 to-pink-500" },
  { name: "James Okafor", email: "james@aurora.org", role: "compliance_officer", tenant: "Aurora Disability", status: "active", lastActive: "1h ago", color: "from-emerald-500 to-teal-500" },
  { name: "Daniel Wu", email: "daniel@meridian.care", role: "support_worker", tenant: "Meridian Home Care", status: "active", lastActive: "3h ago", color: "from-amber-500 to-orange-500" },
  { name: "Sara Hill", email: "sara@northwind.nz", role: "operations_admin", tenant: "Northwind Care", status: "invited", lastActive: "—", color: "from-fuchsia-500 to-purple-500" },
  { name: "Tom Reed", email: "tom@brightpath.care", role: "billing_officer", tenant: "Brightpath", status: "active", lastActive: "Yesterday", color: "from-sky-500 to-cyan-500" },
  { name: "Olivia Park", email: "olivia@havenwell.us", role: "support_worker", tenant: "Havenwell", status: "disabled", lastActive: "2 weeks ago", color: "from-slate-500 to-slate-700" },
];

const UsersPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

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
              placeholder="Search users..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
            />
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{users.length}</span> users across {new Set(users.map((u) => u.tenant)).size} tenants
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Tenant</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last active</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${u.color} text-white text-xs font-bold flex items-center justify-center`}>
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
                    <Badge tone="indigo">{ROLE_LABELS[u.role]}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">{u.tenant}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={u.status === "active" ? "emerald" : u.status === "invited" ? "amber" : "slate"} dot>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{u.lastActive}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => notify(`${u.name} user actions opened in demo mode.`)}
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
      </Card>
    </div>
  );
};

export default UsersPage;
