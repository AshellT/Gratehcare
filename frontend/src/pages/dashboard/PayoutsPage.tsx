import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { useActionQuery } from "@/hooks/useActionQuery";
import { claimsApi } from "@/lib/api/claims";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import { useToast } from "@/context/ToastContext";

type PayoutRow = {
  id: string;
  number: string;
  payer: string;
  amount: number;
  paidAt?: string;
  clientName?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const PayoutsPage: React.FC = () => {
  const toast = useToast();
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ payer: "NDIS", service: "", amount: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await claimsApi.list({ status: "PAID", limit: 50 });
      setRows(
        (res.data ?? []).map((c: any) => ({
          id: c.id,
          number: c.number,
          payer: c.payer ?? "—",
          amount: Number(c.amount) || 0,
          paidAt: c.paidAt,
          clientName: c.client?.fullName,
        })),
      );
    } catch {
      toast.error("Failed to load payouts", "Could not fetch paid claims.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useActionQuery("create", () => setShowCreate(true));

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
          claimStatus: "PAID",
        }) as any,
      );
      toast.success("Payout recorded");
      setShowCreate(false);
      setForm({ payer: "NDIS", service: "", amount: "" });
      await load();
    } catch {
      toast.error("Record failed", "Could not record payout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Payouts"
        description="Paid claims, remittance and payout reconciliation."
        actions={[
          {
            label: "Record payout",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />

      <Card title="Paid claims" description="Claims marked as paid in the finance module.">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading payouts…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">No payouts yet</div>
            <p className="mt-1 text-sm text-slate-500">Record a payout or mark claims as paid to see them here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="font-mono text-sm font-bold text-slate-900">{row.number}</div>
                  <div className="text-sm text-slate-600">
                    {row.clientName ?? "—"} · {row.payer}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{money(row.amount)}</div>
                  <Badge tone="emerald">paid</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Record payout">
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
            {saving ? "Saving…" : "Record payout"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PayoutsPage;
