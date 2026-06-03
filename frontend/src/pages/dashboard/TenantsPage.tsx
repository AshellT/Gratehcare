import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, MoreHorizontal, Building2 } from "lucide-react";
import { useActionQuery } from "@/hooks/useActionQuery";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { tenantsApi } from "@/lib/api/tenants";
import { useToast } from "@/context/ToastContext";
import type { Tenant } from "@/lib/api/types";

type TenantRow = {
  id: string;
  name: string;
  plan: string;
  staff: string;
  mrr: string;
  health: string;
  region: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const TenantsPage: React.FC = () => {
  const toast = useToast();
  const [rows, setRows] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", region: "AU" });
  const [selected, setSelected] = useState<TenantRow | null>(null);

  useActionQuery("create", () => setShowCreate(true));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await tenantsApi.list();
        if (!mounted) return;
        
        if (res.data && res.data.length > 0) {
          const mapped: TenantRow[] = res.data.map((t: Tenant) => ({
            id: t.id,
            name: t.name,
            plan: "—",
            staff: "—",
            mrr: "—",
            health: "—",
            region: t.region || "AU",
          }));
          setRows(mapped);
        }
      } catch (error) {
        if (mounted) {
          toast.error("Failed to load tenants", "Could not fetch tenant data from backend");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) => t.name.toLowerCase().includes(q) || t.region.toLowerCase().includes(q));
  }, [query, rows]);

  const openCreate = () => {
    setForm({ name: "", slug: "", region: "AU" });
    setShowCreate(true);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Organisation name required");
      return;
    }
    const slug = form.slug.trim() || slugify(form.name);
    setSaving(true);
    try {
      const created = await tenantsApi.create({
        name: form.name.trim(),
        slug,
        region: form.region.trim() || undefined,
      });
      const row: TenantRow = {
        id: created.id || `local-${Date.now()}`,
        name: created.name || form.name.trim(),
        plan: "—",
        staff: "—",
        mrr: "—",
        health: "—",
        region: form.region || "AU",
      };
      setRows((prev) => [row, ...prev]);
      setShowCreate(false);
      toast.success("Tenant created", `${row.name} is now on the platform.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create tenant";
      toast.error("Create failed", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Tenants"
        description="Every organisation running on GRATEHCARE."
        actions={[
          { label: "Add tenant", icon: <Plus className="h-4 w-4" />, onClick: openCreate },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total tenants" value={loading ? "..." : String(rows.length)} tone="indigo" icon={<Building2 className="h-5 w-5" />} index={0} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tenants..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Organisation</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">MRR</th>
                <th className="px-5 py-3">Region</th>
                <th className="px-5 py-3">Health</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                    Loading tenants...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                    {query ? "No tenants match your search" : "No tenants yet. Click 'Add tenant' to create one."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white text-xs font-bold flex items-center justify-center">
                          {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-500">tenant_{slugify(t.name).slice(0, 14)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="slate">{t.plan}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{t.staff}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{t.mrr}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{t.region}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone="slate">
                        {t.health}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelected(t)}
                        aria-label={`Open actions for ${t.name}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add tenant"
        description="Create a new organisation on the platform."
        footer={
          <>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" form="create-tenant-form" disabled={saving} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? "Creating…" : "Create tenant"}
            </button>
          </>
        }
      >
        <form id="create-tenant-form" onSubmit={handleCreate} className="space-y-4">
          <FormField
            label="Organisation name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
          />
          <FormField label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} hint="Used in URLs and API identifiers" />
          <FormField label="Region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
        </form>
      </Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || "Tenant"} size="sm">
        {selected && (
          <div className="space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Plan:</span> {selected.plan}</p>
            <p><span className="font-semibold text-slate-900">Region:</span> {selected.region}</p>
            <p><span className="font-semibold text-slate-900">Health:</span> {selected.health}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TenantsPage;
