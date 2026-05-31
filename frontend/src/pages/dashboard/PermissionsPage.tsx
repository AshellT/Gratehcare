import React, { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { useActionQuery } from "@/hooks/useActionQuery";
import { rolesApi } from "@/lib/api/roles";
import { ROLE_LABELS, prismaRoleToUi, roleToPrisma, type Role } from "@/lib/roles";
import { useToast } from "@/context/ToastContext";

const PermissionsPage: React.FC = () => {
  const toast = useToast();
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: "", role: "SUPER_ADMIN" as string });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await rolesApi.listPermissions();
      setMatrix(data as Record<string, string[]>);
    } catch {
      toast.error("Failed to load permissions", "Could not fetch role matrix from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [toast]);

  useActionQuery("create", () => setAssignOpen(true));

  const rows = useMemo(
    () =>
      Object.entries(matrix).map(([role, perms]) => ({
        role,
        label: prismaRoleToUi(role) ? ROLE_LABELS[prismaRoleToUi(role)!] : role,
        perms,
      })),
    [matrix],
  );

  const handleAssign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignForm.userId.trim()) {
      toast.warning("User ID required");
      return;
    }
    setSaving(true);
    try {
      await rolesApi.assign({
        userId: assignForm.userId.trim(),
        role: assignForm.role,
      });
      toast.success("Role assigned", "The user role has been updated.");
      setAssignOpen(false);
      setAssignForm({ userId: "", role: "SUPER_ADMIN" });
    } catch {
      toast.error("Assign failed", "Could not assign role. Check the user ID and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="System"
        title="Roles & permissions"
        description="Platform role matrix and role assignment for tenant users."
        actions={[
          {
            label: "Assign role",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setAssignOpen(true),
          },
        ]}
      />

      {assignOpen && (
        <Card title="Assign role" description="Grant a platform or tenant role to an existing user.">
          <form onSubmit={handleAssign} className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <input
              value={assignForm.userId}
              onChange={(e) => setAssignForm((f) => ({ ...f, userId: e.target.value }))}
              placeholder="User ID (UUID)"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={assignForm.role}
              onChange={(e) => setAssignForm((f) => ({ ...f, role: e.target.value }))}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={roleToPrisma(r)}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Assign"}
            </button>
          </form>
        </Card>
      )}

      <Card
        title="Permission matrix"
        description="Capabilities granted to each role across the platform."
        icon={<KeyRound className="h-4 w-4" />}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading permissions…
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Permissions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.role} className="border-b border-slate-100">
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{row.label}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {row.perms.map((p) => (
                          <Badge key={p} tone="indigo">
                            {p}
                          </Badge>
                        ))}
                      </div>
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

export default PermissionsPage;
