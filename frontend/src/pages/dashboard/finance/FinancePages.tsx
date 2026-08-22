import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CreditCard,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import StatCard from "@/components/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useActionQuery } from "@/hooks/useActionQuery";
import { useClients } from "@/hooks/useClients";
import { billingApi, type FinanceOverview } from "@/lib/api/billing";
import { claimsApi } from "@/lib/api/claims";
import { toTenantRecord } from "@/lib/api/tenantRecord";
import Modal from "@/components/dashboard/Modal";
import FormField from "@/components/dashboard/FormField";
import type { Claim, Invoice } from "@/lib/api/types";

type FinancePageKind =
  | "overview"
  | "billing-dashboard"
  | "invoices"
  | "invoice-builder"
  | "claims"
  | "claim-tracking"
  | "payments"
  | "reconciliation"
  | "client-funding"
  | "revenue-reports"
  | "outstanding-balances";

type FinanceRecord = {
  id: string;
  backendId?: string;
  recordType?: "invoice" | "claim";
  client: string;
  payer: string;
  service: string;
  amount: number;
  issued: string;
  due: string;
  paid?: string;
  status: "draft" | "ready" | "sent" | "paid" | "overdue" | "disputed" | "submitted" | "review" | "approved" | "rejected" | "matched" | "unmatched" | "allocated" | "low-funds";
  owner: string;
  warning?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);

const fmtDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
};

const pageMeta: Record<FinancePageKind, { title: string; description: string; eyebrow: string }> = {
  overview: {
    eyebrow: "Finance",
    title: "Financial Overview",
    description: "High-level revenue, cashflow, funding risk and collections health.",
  },
  "billing-dashboard": {
    eyebrow: "Billing",
    title: "Billing Dashboard",
    description: "Daily billing work queue, validation warnings and invoice throughput.",
  },
  invoices: {
    eyebrow: "Billing",
    title: "Invoices",
    description: "Create, send, track and follow up on client and payer invoices.",
  },
  "invoice-builder": {
    eyebrow: "Billing",
    title: "Invoice Builder",
    description: "Assemble billable services, validate rates and prepare invoice batches.",
  },
  claims: {
    eyebrow: "Claims",
    title: "Claims",
    description: "Submit and manage NDIS, insurer and package claims.",
  },
  "claim-tracking": {
    eyebrow: "Claims",
    title: "Claim Tracking",
    description: "Monitor every claim stage from submitted to paid or rejected.",
  },
  payments: {
    eyebrow: "Payments",
    title: "Payments",
    description: "Capture, allocate and review incoming card, bank and payer deposits.",
  },
  reconciliation: {
    eyebrow: "Finance Ops",
    title: "Reconciliation",
    description: "Match deposits against invoices, claims and remittance advice.",
  },
  "client-funding": {
    eyebrow: "Funding",
    title: "Client Funding",
    description: "Track budgets, utilisation, funding warnings and service coverage.",
  },
  "revenue-reports": {
    eyebrow: "Reports",
    title: "Revenue Reports",
    description: "Revenue by payer, service line, site and ageing period.",
  },
  "outstanding-balances": {
    eyebrow: "Collections",
    title: "Outstanding Balances",
    description: "Prioritise overdue accounts, disputes and collection actions.",
  },
};


const invoiceStatusMap: Record<string, FinanceRecord['status']> = {
  draft: 'draft',
  sent: 'sent',
  pending: 'sent',
  paid: 'paid',
  overdue: 'overdue',
  disputed: 'disputed',
  cancelled: 'draft',
};

const mapInvoice = (inv: Invoice): FinanceRecord => ({
  id: inv.invoiceNumber || inv.id,
  backendId: inv.id,
  recordType: "invoice",
  client: inv.clientName,
  payer: inv.payer || "—",
  service: "Care services",
  amount: inv.amount,
  issued: inv.issuedAt,
  due: inv.dueAt,
  paid: inv.status === "paid" ? inv.paidAt || inv.dueAt : undefined,
  status: invoiceStatusMap[inv.status] ?? "sent",
  owner: "—",
  warning:
    inv.status === "overdue"
      ? "Invoice is past due and should be collected or followed up."
      : !inv.clientName || inv.clientName === "—"
        ? "No client is linked to this invoice."
        : undefined,
});

const claimStatusMap: Record<string, FinanceRecord["status"]> = {
  draft: "draft",
  submitted: "submitted",
  review: "review",
  approved: "approved",
  paid: "paid",
  rejected: "rejected",
};

const mapClaim = (claim: Claim): FinanceRecord => ({
  id: claim.number || claim.id,
  backendId: claim.id,
  recordType: "claim",
  client: claim.clientName ?? claim.client?.fullName ?? "—",
  payer: claim.payer ?? "—",
  service: claim.service ?? "Care services",
  amount: Number(claim.amount),
  issued: claim.submittedAt ?? claim.createdAt ?? new Date().toISOString(),
  due: claim.paidAt ?? claim.submittedAt ?? new Date().toISOString(),
  paid: claim.status === "paid" ? claim.paidAt : undefined,
  status: claimStatusMap[String(claim.status).toLowerCase()] ?? "submitted",
  owner: "—",
});

const statusTone: Record<FinanceRecord["status"], any> = {
  draft: "slate",
  ready: "indigo",
  sent: "sky",
  paid: "emerald",
  overdue: "rose",
  disputed: "amber",
  submitted: "indigo",
  review: "amber",
  approved: "emerald",
  rejected: "rose",
  matched: "emerald",
  unmatched: "amber",
  allocated: "sky",
  "low-funds": "rose",
};

// Only these pages map to a real backend create (invoice or claim).
// Other finance pages (payments, reconciliation, funding, etc.) have no
// create endpoint, so we don't show a misleading create button there.
const CREATE_KINDS: FinancePageKind[] = [
  "invoices",
  "billing-dashboard",
  "invoice-builder",
  "claims",
  "claim-tracking",
];

const pageRecords = (
  kind: FinancePageKind,
  source: FinanceRecord[],
  claimSource: FinanceRecord[],
  fundingSource: FinanceRecord[] = [],
  family = false,
) => {
  const familyRows = family ? source : source;

  if (kind === "invoices" || kind === "billing-dashboard" || kind === "invoice-builder") {
    return familyRows;
  }
  if (kind === "claims" || kind === "claim-tracking") {
    return claimSource;
  }
  if (kind === "payments" || kind === "reconciliation") {
    return familyRows.filter((record) =>
      ["paid", "matched", "sent", "overdue", "allocated"].includes(record.status),
    );
  }
  if (kind === "client-funding") {
    return fundingSource;
  }
  if (kind === "outstanding-balances") {
    return familyRows.filter((record) => ["sent", "overdue", "disputed"].includes(record.status));
  }
  return familyRows;
};

const FinancePage: React.FC<{ kind: FinancePageKind; familyOnly?: boolean }> = ({
  kind,
  familyOnly,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [claimRecords, setClaimRecords] = useState<FinanceRecord[]>([]);
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ clientId: "", service: "", amount: "", payer: "NDIS" });
  const { data: clientsData } = useClients();
  const clients = clientsData?.data ?? [];
  const fundingRows: FinanceRecord[] = (overview?.funding ?? []).map((row) => ({
    id: row.clientId.slice(0, 8).toUpperCase(),
    backendId: row.clientId,
    recordType: "invoice",
    client: row.clientName,
    payer: row.funding || "—",
    service: "Funding package",
    amount: row.outstanding || row.billed,
    issued: row.since,
    due: row.since,
    status: row.status === "low-funds" ? "low-funds" : "allocated",
    owner: "—",
  }));

  const reload = useCallback(async () => {
    const [invoiceRes, claimRes, overviewRes] = await Promise.all([
      billingApi.listInvoices(),
      claimsApi.list(),
      billingApi.overview().catch(() => null),
    ]);
    setRecords((invoiceRes.data ?? []).map(mapInvoice));
    setClaimRecords((claimRes.data ?? []).map(mapClaim));
    setOverview(overviewRes);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await reload();
      } catch {
        if (mounted) toast.error("Failed to load billing data", "Could not fetch finance records from backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [kind, toast, reload]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    if (!checkout) return;
    if (checkout === "success" && sessionId) {
      billingApi
        .confirmCheckout(sessionId)
        .then((result) => {
          if (result.paid) toast.success("Payment received", "Stripe marked this invoice as paid.");
          return reload();
        })
        .catch(() =>
          toast.error("Payment pending", "Stripe checkout finished but the invoice is not marked paid yet."),
        )
        .finally(() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("checkout");
            next.delete("session_id");
            return next;
          }, { replace: true });
        });
    } else if (checkout === "cancel") {
      toast.warning("Checkout cancelled");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("checkout");
        return next;
      }, { replace: true });
    }
  }, [reload, searchParams, setSearchParams, toast]);

  const [selected, setSelected] = useState<FinanceRecord | null>(null);
  const [status, setStatus] = useState("All statuses");
  const [payer, setPayer] = useState("All payers");
  const [query, setQuery] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const canManage =
    !familyOnly &&
    (user?.role === "billing_officer" || user?.role === "org_owner");
  const canCreate = canManage && CREATE_KINDS.includes(kind);
  const rows = useMemo(() => {
    const source = pageRecords(
      kind,
      records,
      claimRecords,
      fundingRows,
      familyOnly || user?.role === "family",
    );
    return source.filter((record) => {
      const statusMatch = status === "All statuses" || record.status === status;
      const payerMatch = payer === "All payers" || record.payer === payer;
      const textMatch = `${record.id} ${record.client} ${record.payer} ${record.service}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return statusMatch && payerMatch && textMatch;
    });
  }, [claimRecords, familyOnly, fundingRows, kind, payer, query, records, status, user?.role]);

  const meta = familyOnly
    ? {
        eyebrow: "Family portal",
        title: "Shared Invoices & Payments",
        description: "Invoices and payment history shared with your family portal.",
      }
    : pageMeta[kind];

  const total = overview
    ? kind === "claims" || kind === "claim-tracking"
      ? overview.stats.claimsPipeline + overview.stats.claimsPaid
      : kind === "payments"
        ? overview.stats.collected
        : kind === "revenue-reports"
          ? overview.stats.revenue
          : overview.stats.receivable + overview.stats.collected
    : rows.reduce((sum, row) => sum + row.amount, 0);
  const warnings = rows.filter((row) => row.warning);
  const stripeWaiting = overview?.stripe.waiting ?? true;
  const stripeEnabled = overview?.stripe.paymentsEnabled ?? false;
  const notify = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2600);
  };

  useActionQuery("create", () => {
    if (canCreate) setShowCreate(true);
  });

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (kind === "claims" || kind === "claim-tracking") {
        await claimsApi.create(
          toTenantRecord(createForm.service.trim() || "Claim", undefined, {
            payer: createForm.payer,
            amount: Number(createForm.amount) || 0,
            clientId: createForm.clientId || undefined,
            claimStatus: "SUBMITTED",
            submittedAt: new Date().toISOString(),
          }) as any,
        );
      } else {
        const number = `INV-${Date.now().toString().slice(-6)}`;
        await billingApi.createInvoice(
          toTenantRecord(number, undefined, {
            amount: Number(createForm.amount) || 0,
            clientId: createForm.clientId || undefined,
          }) as any,
        );
      }
      toast.success("Record created");
      setShowCreate(false);
      setCreateForm({ clientId: "", service: "", amount: "", payer: "NDIS" });
      await reload();
    } catch {
      toast.error("Create failed", "Could not save finance record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={
          familyOnly || user?.role === "family"
            ? "Read-only family billing view with shared invoice and payment details."
            : meta.description
        }
        actions={[
          ...(canCreate
            ? [{ label: primaryAction(kind), icon: <Plus className="h-4 w-4" />, onClick: () => setShowCreate(true) }]
            : []),
        ]}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={primaryAction(kind)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Client">
            <select
              value={createForm.clientId}
              onChange={(e) => setCreateForm((f) => ({ ...f, clientId: e.target.value }))}
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
          {(kind === "claims" || kind === "claim-tracking") && (
            <>
              <FormField label="Service">
                <input
                  value={createForm.service}
                  onChange={(e) => setCreateForm((f) => ({ ...f, service: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </FormField>
              <FormField label="Payer">
                <select
                  value={createForm.payer}
                  onChange={(e) => setCreateForm((f) => ({ ...f, payer: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {["NDIS", "Aged Care", "Private", "Allianz"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </FormField>
            </>
          )}
          <FormField label="Amount">
            <input
              type="number"
              value={createForm.amount}
              onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </form>
      </Modal>

      {actionMessage && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {actionMessage}
        </div>
      )}

      {(kind === "payments" || kind === "overview" || kind === "billing-dashboard") && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            stripeEnabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <div className="font-semibold">
            {stripeEnabled ? "Stripe payments are live" : "Stripe payments are waiting"}
          </div>
          <p className="mt-1">
            {stripeEnabled
              ? "Unpaid invoices can be collected with Stripe Checkout. Webhooks mark invoices paid automatically."
              : "Add STRIPE_SECRET_KEY on the server. Card collection starts as soon as the key is present — no extra code change."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={kind === "payments" ? "Collected" : kind === "claims" || kind === "claim-tracking" ? "Claims value" : "Receivable value"}
          value={money(
            kind === "payments"
              ? overview?.stats.collected ?? total
              : kind === "claims" || kind === "claim-tracking"
                ? (overview?.stats.claimsPipeline ?? 0) + (overview?.stats.claimsPaid ?? 0)
                : overview?.stats.receivable ?? total,
          )}
          tone="emerald"
          icon={<Wallet className="h-5 w-5" />}
          index={0}
        />
        <StatCard
          label={kind === "payments" ? "Open invoices" : "Open items"}
          value={`${overview ? (kind === "claims" || kind === "claim-tracking" ? overview.stats.openClaims : overview.stats.openInvoices) : rows.length}`}
          tone="indigo"
          icon={<Receipt className="h-5 w-5" />}
          index={1}
        />
        <StatCard
          label="Validation warnings"
          value={`${warnings.length}`}
          tone={warnings.length ? "amber" : "emerald"}
          icon={<ShieldAlert className="h-5 w-5" />}
          index={2}
        />
        <StatCard
          label="Overdue risk"
          value={money(overview?.stats.overdue ?? rows.filter((row) => row.status === "overdue").reduce((sum, row) => sum + row.amount, 0))}
          tone="rose"
          icon={<AlertTriangle className="h-5 w-5" />}
          index={3}
        />
      </div>

      <ValidationPanel warnings={warnings} />

      {(kind === "invoice-builder" || kind === "reconciliation" || kind === "client-funding") && (
        <WorkflowPanel kind={kind} canManage={canManage} />
      )}

      <Card
        title={tableTitle(kind, familyOnly || user?.role === "family")}
        description={`${rows.length} records · ${money(total)} visible value`}
        action={<FilterSummary status={status} payer={payer} />}
      >
        <Filters
          status={status}
          payer={payer}
          query={query}
          onStatus={setStatus}
          onPayer={setPayer}
          onQuery={setQuery}
        />
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading billing records...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <div className="font-display text-lg font-bold text-slate-900">
              {kind === "payments" ? "No payments yet" : kind === "claims" || kind === "claim-tracking" ? "No claims yet" : "No billing records yet"}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {kind === "payments"
                ? stripeWaiting
                  ? "Paid invoices will appear here. Card collection starts when Stripe keys are added."
                  : "Collect outstanding invoices with Stripe or mark a payment received."
                : "Create invoices or claims to see them here."}
            </p>
          </div>
        ) : (
          <FinanceTable rows={rows} onSelect={setSelected} readonly={!canManage} />
        )}
      </Card>

      {kind === "revenue-reports" && <RevenueBreakdown overview={overview} />}

      {selected && (
        <DetailDrawer
          record={selected}
          canManage={canManage}
          stripeEnabled={stripeEnabled}
          stripeWaiting={stripeWaiting}
          onClose={() => setSelected(null)}
          onRefresh={reload}
          onNotify={notify}
        />
      )}
    </div>
  );
};

const primaryAction = (kind: FinancePageKind) => {
  if (kind === "claims" || kind === "claim-tracking") return "New claim";
  if (kind === "payments") return "Record payment";
  if (kind === "reconciliation") return "Match deposit";
  if (kind === "client-funding") return "Update funding";
  return "New invoice";
};

const tableTitle = (kind: FinancePageKind, family: boolean) => {
  if (family) return "Shared billing records";
  if (kind === "claim-tracking") return "Claim stage tracker";
  if (kind === "invoice-builder") return "Invoice batch queue";
  if (kind === "outstanding-balances") return "Outstanding balances";
  return pageMeta[kind].title;
};

const FilterSummary: React.FC<{ status: string; payer: string }> = ({ status, payer }) => (
  <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
    <SlidersHorizontal className="h-3.5 w-3.5" />
    {status} · {payer}
  </div>
);

const Filters: React.FC<{
  status: string;
  payer: string;
  query: string;
  onStatus: (value: string) => void;
  onPayer: (value: string) => void;
  onQuery: (value: string) => void;
}> = ({ status, payer, query, onStatus, onPayer, onQuery }) => (
  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
    <label className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search client, payer, invoice or claim"
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
    <select value={status} onChange={(event) => onStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
      {["All statuses", "draft", "ready", "sent", "paid", "overdue", "disputed", "submitted", "review", "approved", "rejected", "matched", "unmatched", "low-funds"].map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
    <select value={payer} onChange={(event) => onPayer(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
      {["All payers", "Family", "NDIS", "Aged Care", "Private", "Allianz"].map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </div>
);

const FinanceTable: React.FC<{
  rows: FinanceRecord[];
  onSelect: (record: FinanceRecord) => void;
  readonly: boolean;
}> = ({ rows, onSelect, readonly }) => (
  <div className="overflow-x-auto -mx-5">
    <table className="min-w-full">
      <thead>
        <tr className="border-b border-slate-200 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <th className="px-5 py-3">Reference</th>
          <th className="px-5 py-3">Client</th>
          <th className="px-5 py-3">Payer</th>
          <th className="px-5 py-3">Service</th>
          <th className="px-5 py-3">Amount</th>
          <th className="px-5 py-3">Due</th>
          <th className="px-5 py-3">Status</th>
          <th className="px-5 py-3">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
            <td className="px-5 py-3.5 font-mono text-sm font-semibold text-slate-900">{row.id}</td>
            <td className="px-5 py-3.5 text-sm text-slate-700">{row.client}</td>
            <td className="px-5 py-3.5 text-sm text-slate-600">{row.payer}</td>
            <td className="px-5 py-3.5 text-sm text-slate-600">{row.service}</td>
            <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{money(row.amount)}</td>
            <td className="px-5 py-3.5 text-sm text-slate-500">{fmtDate(row.due)}</td>
            <td className="px-5 py-3.5">
              <Badge tone={statusTone[row.status]} dot>
                {row.status}
              </Badge>
            </td>
            <td className="px-5 py-3.5">
              <button
                onClick={() => onSelect(row)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {readonly ? "View" : "Review"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ValidationPanel: React.FC<{ warnings: FinanceRecord[] }> = ({ warnings }) => (
  <Card
    title="Validation warnings"
    description="Items to review before sending, submitting or closing period."
    icon={<AlertTriangle className="h-4 w-4" />}
  >
    {warnings.length ? (
      <div className="grid gap-3 lg:grid-cols-3">
        {warnings.slice(0, 3).map((warning, index) => (
        <div key={`${warning.id}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold text-amber-900">{warning.id}</span>
            <Badge tone={warning.warning ? "amber" : "emerald"}>{warning.warning ? "review" : "clear"}</Badge>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">
            {warning.warning || "No validation issues detected for this finance item."}
          </p>
        </div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No validation warnings.
      </div>
    )}
  </Card>
);

const WorkflowPanel: React.FC<{ kind: FinancePageKind; canManage: boolean }> = ({
  kind,
  canManage,
}) => {
  const steps =
    kind === "reconciliation"
      ? ["Import bank feed", "Auto-match remittance", "Review exceptions", "Close deposit"]
      : kind === "client-funding"
        ? ["Review budget", "Forecast utilisation", "Flag service risk", "Notify coordinator"]
        : ["Select visits", "Validate rates", "Preview invoice", "Send batch"];

  return (
    <Card title="Workflow" description={canManage ? "Create, send, collect and mark paid from this workspace." : "Read-only workflow preview."}>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-slate-900">{step}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {canManage ? "Ready for action." : "Visible for oversight only."}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const DetailDrawer: React.FC<{
  record: FinanceRecord;
  canManage: boolean;
  stripeEnabled: boolean;
  stripeWaiting: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onNotify: (message: string) => void;
}> = ({ record, canManage, stripeEnabled, stripeWaiting, onClose, onRefresh, onNotify }) => {
  const toast = useToast();
  const [paying, setPaying] = useState(false);
  const unpaidInvoice =
    record.recordType === "invoice" && ["sent", "ready", "overdue", "draft", "disputed"].includes(record.status);

  const postAction = async () => {
    if (!record.backendId) {
      toast.error("Action failed", "Missing record ID from backend.");
      return;
    }
    try {
      if (record.recordType === "claim") {
        const next =
          record.status === "submitted" || record.status === "review"
            ? "APPROVED"
            : record.status === "approved"
              ? "PAID"
              : "SUBMITTED";
        await claimsApi.setStatus(record.backendId, next);
      } else if (record.status === "sent" || record.status === "ready" || record.status === "draft") {
        await billingApi.sendInvoice(record.backendId);
      } else {
        await billingApi.markPaid(record.backendId);
      }
      await onRefresh();
      onNotify(`${record.id} updated.`);
    } catch {
      toast.error("Action failed", "Could not update this finance record.");
    }
  };

  const collectStripe = async () => {
    if (!record.backendId) return;
    setPaying(true);
    try {
      const session = await billingApi.createCheckout(record.backendId);
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      toast.error("Checkout failed", "Stripe did not return a payment URL.");
    } catch (error: any) {
      const code = error?.code || error?.message;
      if (String(code).includes("STRIPE_NOT_CONFIGURED") || stripeWaiting) {
        toast.warning("Waiting for Stripe keys", "Add STRIPE_SECRET_KEY on the server to collect card payments.");
      } else {
        toast.error("Checkout failed", error?.message || "Could not start Stripe checkout.");
      }
    } finally {
      setPaying(false);
    }
  };

  return (
  <div className="fixed inset-0 z-[80] flex justify-end bg-slate-900/30">
    <button className="flex-1 cursor-default" aria-label="Close details" onClick={onClose} />
    <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Detail drawer</div>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">{record.id}</h2>
          <p className="mt-1 text-sm text-slate-500">{record.client} · {record.payer}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-3">
          <Info label="Amount" value={money(record.amount)} />
          <Info label="Status" value={record.status} />
          <Info label="Issued" value={fmtDate(record.issued)} />
          <Info label="Due" value={fmtDate(record.due)} />
          <Info label="Owner" value={record.owner} />
          <Info label="Service" value={record.service} />
        </div>

        {record.warning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">Validation warning</div>
            <p className="mt-1">{record.warning}</p>
          </div>
        )}

        {unpaidInvoice && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {stripeEnabled
              ? "Collect this invoice with Stripe Checkout. The invoice is marked paid when the payment succeeds."
              : "Card collection is waiting for STRIPE_SECRET_KEY. Manual mark-paid still works for billing officers."}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {unpaidInvoice && (
            <button
              onClick={() => void collectStripe()}
              disabled={paying || !stripeEnabled}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {paying ? "Opening Stripe…" : stripeEnabled ? "Collect with Stripe" : "Waiting for Stripe keys"}
            </button>
          )}
          {canManage && (
            <button
              onClick={() => void postAction()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Banknote className="h-4 w-4" />
              {record.recordType === "claim"
                ? record.status === "approved"
                  ? "Mark claim paid"
                  : "Advance claim"
                : record.status === "paid"
                  ? "Already paid"
                  : record.status === "draft"
                    ? "Send invoice"
                    : "Mark paid"}
            </button>
          )}
        </div>
      </div>
    </aside>
  </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

const RevenueBreakdown: React.FC<{ overview: FinanceOverview | null }> = ({ overview }) => {
  const payers = overview?.byPayer ?? [];
  const ageing = overview?.ageing;
  return (
    <Card title="Revenue breakdown" description="Live totals from invoices and claims.">
      {!overview || (payers.length === 0 && !ageing) ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No revenue recorded yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">By payer</div>
            <ul className="mt-3 space-y-2">
              {payers.map((row) => (
                <li key={row.payer} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">{row.payer} · {row.count} items</span>
                  <span className="font-semibold text-slate-900">{money(row.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice ageing</div>
            <ul className="mt-3 space-y-2">
              {[
                ["Current", ageing?.current ?? 0],
                ["1–30 days", ageing?.days30 ?? 0],
                ["31–60 days", ageing?.days60 ?? 0],
                ["90+ days", ageing?.days90 ?? 0],
              ].map(([label, amount]) => (
                <li key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <span className="text-slate-700">{label}</span>
                  <span className="font-semibold text-slate-900">{money(Number(amount))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Collected {money(overview.stats.collected)} · Claims paid {money(overview.stats.claimsPaid)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export const FinancialOverviewPage = () => <FinancePage kind="overview" />;
export const BillingDashboardPage = () => <FinancePage kind="billing-dashboard" />;
export const InvoicesPage = () => <FinancePage kind="invoices" />;
export const InvoiceBuilderPage = () => <FinancePage kind="invoice-builder" />;
export const FinanceClaimsPage = () => <FinancePage kind="claims" />;
export const ClaimTrackingPage = () => <FinancePage kind="claim-tracking" />;
export const PaymentsPage = () => <FinancePage kind="payments" />;
export const ReconciliationPage = () => <FinancePage kind="reconciliation" />;
export const ClientFundingPage = () => <FinancePage kind="client-funding" />;
export const RevenueReportsPage = () => <FinancePage kind="revenue-reports" />;
export const OutstandingBalancesPage = () => <FinancePage kind="outstanding-balances" />;
export const FamilyBillingPage = () => <FinancePage kind="invoices" familyOnly />;
