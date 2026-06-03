import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import { useBilling } from "@/hooks/useBilling";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/context/ToastContext";
import {
  Activity,
  AlertTriangle,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";

const statusTone: Record<string, any> = {
  draft: "slate",
  sent: "indigo",
  paid: "emerald",
  pending: "amber",
  overdue: "rose",
  disputed: "amber",
  cancelled: "slate",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", { day: "2-digit", month: "short" });

const BillingPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const { data, loading, error, stats, create } = useBilling();
  const { data: clientsData } = useClients();
  const clients = clientsData?.data ?? [];
  const toast = useToast();
  const invoices = data?.data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ number: "", clientId: "", amount: "" });
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.number.trim()) {
      toast.warning("Invoice number required");
      return;
    }
    setSaving(true);
    try {
      await create({
        title: form.number.trim(),
        metadata: {
          clientId: form.clientId || undefined,
          amount: Number(form.amount) || 0,
        },
      } as any);
      toast.success("Invoice created", `${form.number.trim()} saved as draft.`);
      setShowCreate(false);
      setForm({ number: "", clientId: "", amount: "" });
    } catch {
      toast.error("Create failed", "Could not create invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Billing"
        description="Invoices, payments and reconciliation in one place."
        actions={[
          {
            label: "Export",
            variant: "secondary",
            icon: <Download className="h-4 w-4" />,
          },
          {
            label: "New invoice",
            icon: <Plus className="h-4 w-4" />,
            onClick: () => setShowCreate(true),
          },
        ]}
      />

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Outstanding"
          value={fmt(stats.outstanding)}
          tone="amber"
          icon={<Receipt className="h-5 w-5" />}
          index={0}
        />
        <StatCard
          label="Paid this month"
          value={fmt(stats.paidThisMonth)}
          tone="emerald"
          icon={<Wallet className="h-5 w-5" />}
          delta={{ value: "+12%", direction: "up" }}
          index={1}
        />
        <StatCard
          label="Avg. days to pay"
          value="11d"
          tone="indigo"
          icon={<Activity className="h-5 w-5" />}
          delta={{ value: "-3d", direction: "up" }}
          index={2}
        />
        <StatCard
          label="Overdue"
          value={String(stats.overdue)}
          tone="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
          index={3}
        />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-display font-bold text-slate-900">
              Invoices
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{invoices.length} this month</span>
            {loading && (
              <span className="ml-2 text-indigo-500 animate-pulse text-xs">
                Loading…
              </span>
            )}
          </div>
          <button
            onClick={() => notify("Invoice filters opened in demo mode.")}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Issued</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  data-testid={`invoice-row-${inv.invoiceNumber}`}
                  className="border-b border-slate-100 hover:bg-slate-50/60"
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-semibold text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-700">
                    {inv.clientName}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {fmtDate(inv.issuedAt)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {fmtDate(inv.dueAt)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                    {fmt(inv.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone[inv.status]} dot>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() =>
                        notify(
                          `${inv.invoiceNumber} actions opened in demo mode.`,
                        )
                      }
                      aria-label={`Open actions for ${inv.invoiceNumber}`}
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

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New invoice"
        description="Create a draft invoice for a client."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Invoice number">
            <input
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              placeholder="INV-1001"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <FormField label="Client">
            <select
              value={form.clientId}
              onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Amount">
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create invoice"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BillingPage;
