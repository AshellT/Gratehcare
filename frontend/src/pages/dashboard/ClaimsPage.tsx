import React, { useCallback, useEffect, useState } from "react";
import { Plus, Download, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { useActionQuery } from "@/hooks/useActionQuery";
import { claimsApi } from "@/lib/api/claims";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import { useToast } from "@/context/ToastContext";

type RawClaim = {
  id: string;
  number: string;
  payer?: string;
  service?: string;
  amount: number | string;
  status: string;
  submittedAt?: string;
  paidAt?: string;
  client?: { fullName?: string };
};

const statusTone: Record<string, "indigo" | "amber" | "emerald" | "rose" | "slate"> = {
  draft: "slate",
  submitted: "indigo",
  review: "amber",
  approved: "emerald",
  paid: "emerald",
  rejected: "rose",
};

const money = (value: number | string) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(
    Number(value),
  );

const ClaimsPage: React.FC = () => {
  const toast = useToast();
  const [claims, setClaims] = useState<RawClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ service: "", payer: "NDIS", amount: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await claimsApi.list({ limit: 50 });
      setClaims(res.data ?? []);
    } catch {
      toast.error("Failed to load claims", "Could not fetch claims from backend.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useActionQuery("create", () => setShowCreate(true));

  const handleExport = () => {
    if (!claims.length) {
      toast.warning("No claims to export");
      return;
    }
    const header = "number,payer,service,amount,status\n";
    const body = claims
      .map((c) =>
        [c.number, c.payer ?? "", c.service ?? "", c.amount, c.status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claims-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.service.trim()) {
      toast.warning("Service description required");
      return;
    }
    setSaving(true);
    try {
      await claimsApi.create(
        toTenantRecord(form.service.trim(), undefined, {
          payer: form.payer,
          amount: Number(form.amount) || 0,
          claimStatus: "SUBMITTED",
          submittedAt: new Date().toISOString(),
        }) as any,
      );
      toast.success("Claim submitted");
      setShowCreate(false);
      setForm({ service: "", payer: "NDIS", amount: "" });
      await load();
    } catch {
      toast.error("Create failed", "Could not submit claim.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Claims"
        description="Submit, track and reconcile insurer and package claims."
        actions={[
          {
            label: "Export",
            variant: "secondary",
            icon: <Download className="h-4 w-4" />,
            onClick: handleExport,
          },
          {
            label: "New claim",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />
      <Card title="Claims pipeline" description="Live claims from the finance API.">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading claims…
          </div>
        ) : claims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No claims yet</div>
            <p className="mt-1 text-sm text-slate-500">Claims will appear here once submitted in the backend.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <li key={claim.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="font-mono text-sm font-bold text-slate-900">{claim.number}</div>
                  <div className="text-sm text-slate-600">
                    {claim.client?.fullName ?? (claim as { clientName?: string }).clientName ?? "—"} · {claim.payer ?? "—"} · {claim.service ?? "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{money(claim.amount)}</div>
                  <Badge tone={statusTone[claim.status] ?? "slate"}>{claim.status.toLowerCase()}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New claim">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Service">
            <input
              value={form.service}
              onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Payer">
            <select
              value={form.payer}
              onChange={(e) => setForm((f) => ({ ...f, payer: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {["NDIS", "Aged Care", "Private", "Allianz"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Amount">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Submitting…" : "Submit claim"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ClaimsPage;
