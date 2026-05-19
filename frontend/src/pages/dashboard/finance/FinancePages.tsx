import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Filter,
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
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const records: FinanceRecord[] = [
  { id: "INV-4028", client: "Eleanor Rivers", payer: "Family", service: "In-home support", amount: 1240, issued: "Apr 01", due: "Apr 15", paid: "Apr 08", status: "paid", owner: "Priya Raman" },
  { id: "INV-4027", client: "Marcus Thompson", payer: "NDIS", service: "Community access", amount: 2180, issued: "Apr 01", due: "Apr 15", status: "sent", owner: "Daniel Wu" },
  { id: "INV-4026", client: "Alana Williams", payer: "Aged Care", service: "Personal care", amount: 840, issued: "Mar 28", due: "Apr 11", status: "overdue", owner: "Sara Hill", warning: "Payment is 16 days overdue. Reminder sequence paused for funding review." },
  { id: "INV-4025", client: "Henry Park", payer: "Private", service: "Respite", amount: 1560, issued: "Mar 28", due: "Apr 12", status: "disputed", owner: "Tom Reed", warning: "Line item rate does not match current service agreement." },
  { id: "CLM-2196", client: "Eleanor Rivers", payer: "NDIS", service: "Therapy support", amount: 1420, issued: "Apr 03", due: "Apr 18", status: "approved", owner: "Priya Raman" },
  { id: "CLM-2195", client: "Marcus Thompson", payer: "Allianz", service: "Transport", amount: 840, issued: "Apr 03", due: "Apr 18", status: "review", owner: "Daniel Wu", warning: "Missing progress note attachment." },
  { id: "CLM-2194", client: "Maya Krishnan", payer: "NDIS", service: "Plan management", amount: 580, issued: "Mar 30", due: "Apr 13", status: "rejected", owner: "Sara Hill", warning: "Rejected code: support category exhausted." },
  { id: "PAY-1188", client: "Eleanor Rivers", payer: "Family", service: "Card payment", amount: 1240, issued: "Apr 08", due: "Apr 08", paid: "Apr 08", status: "matched", owner: "Finance" },
  { id: "PAY-1187", client: "Marcus Thompson", payer: "NDIS", service: "Bank deposit", amount: 2100, issued: "Apr 07", due: "Apr 07", paid: "Apr 07", status: "unmatched", owner: "Finance", warning: "Deposit is $80 short against invoice INV-4027." },
  { id: "FND-774", client: "Alana Williams", payer: "Aged Care", service: "Monthly package", amount: 3840, issued: "Apr 01", due: "Apr 30", status: "low-funds", owner: "Coordinator", warning: "Projected funding balance drops below two weeks of rostered services." },
];

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

const pageRecords = (kind: FinancePageKind, family = false) => {
  const familyRows = family
    ? records.filter((record) => ["Eleanor Rivers", "Maya Krishnan"].includes(record.client))
    : records;

  if (kind === "invoices" || kind === "billing-dashboard" || kind === "invoice-builder") {
    return familyRows.filter((record) => record.id.startsWith("INV"));
  }
  if (kind === "claims" || kind === "claim-tracking") {
    return familyRows.filter((record) => record.id.startsWith("CLM"));
  }
  if (kind === "payments" || kind === "reconciliation") {
    return familyRows.filter((record) => record.id.startsWith("PAY"));
  }
  if (kind === "client-funding") {
    return familyRows.filter((record) => record.id.startsWith("FND") || record.status === "low-funds");
  }
  if (kind === "outstanding-balances") {
    return familyRows.filter((record) => ["sent", "overdue", "disputed", "unmatched", "rejected"].includes(record.status));
  }
  return familyRows;
};

const FinancePage: React.FC<{ kind: FinancePageKind; familyOnly?: boolean }> = ({
  kind,
  familyOnly,
}) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<FinanceRecord | null>(null);
  const [status, setStatus] = useState("All statuses");
  const [payer, setPayer] = useState("All payers");
  const [query, setQuery] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const canManage = user?.role === "billing_officer" && !familyOnly;
  const isOwnerView = user?.role === "org_owner";
  const rows = useMemo(() => {
    const source = pageRecords(kind, familyOnly || user?.role === "family");
    return source.filter((record) => {
      const statusMatch = status === "All statuses" || record.status === status;
      const payerMatch = payer === "All payers" || record.payer === payer;
      const textMatch = `${record.id} ${record.client} ${record.payer} ${record.service}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return statusMatch && payerMatch && textMatch;
    });
  }, [familyOnly, kind, payer, query, status, user?.role]);

  const meta = familyOnly
    ? {
        eyebrow: "Family portal",
        title: "Shared Invoices & Payments",
        description: "Invoices and payment history shared with your family portal.",
      }
    : pageMeta[kind];

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const warnings = rows.filter((row) => row.warning);
  const notify = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 2600);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={
          familyOnly || user?.role === "family"
            ? "Read-only family billing view with shared invoice and payment details."
            : isOwnerView
              ? `${meta.description} Overview access only.`
              : meta.description
        }
        actions={[
          { label: "Export", variant: "secondary", icon: <Download className="h-4 w-4" /> },
          ...(canManage
            ? [{ label: primaryAction(kind), icon: <Plus className="h-4 w-4" /> }]
            : []),
        ]}
      />

      {actionMessage && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receivable value" value={money(total)} tone="emerald" icon={<Wallet className="h-5 w-5" />} delta={{ value: "+8%", direction: "up" }} index={0} />
        <StatCard label="Open items" value={`${rows.length}`} tone="indigo" icon={<Receipt className="h-5 w-5" />} index={1} />
        <StatCard label="Validation warnings" value={`${warnings.length}`} tone={warnings.length ? "amber" : "emerald"} icon={<ShieldAlert className="h-5 w-5" />} index={2} />
        <StatCard label="Overdue risk" value={money(rows.filter((row) => row.status === "overdue").reduce((sum, row) => sum + row.amount, 0))} tone="rose" icon={<AlertTriangle className="h-5 w-5" />} index={3} />
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
          onSavedViews={() => notify("Saved finance views opened in demo mode.")}
        />
        <FinanceTable rows={rows} onSelect={setSelected} readonly={!canManage} />
      </Card>

      {kind === "revenue-reports" && <RevenueBreakdown />}

      {selected && (
        <DetailDrawer
          record={selected}
          canManage={canManage}
          onClose={() => setSelected(null)}
          onAction={notify}
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
  onSavedViews: () => void;
}> = ({ status, payer, query, onStatus, onPayer, onQuery, onSavedViews }) => (
  <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
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
    <button
      onClick={onSavedViews}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      <Filter className="h-4 w-4" />
      Saved views
    </button>
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
            <td className="px-5 py-3.5 text-sm text-slate-500">{row.due}</td>
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
    <div className="grid gap-3 lg:grid-cols-3">
      {(warnings.length ? warnings : records.slice(0, 3)).slice(0, 3).map((warning, index) => (
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
    <Card title="Workflow" description={canManage ? "Create/edit controls enabled for Billing Officer." : "Read-only workflow preview."}>
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
  onClose: () => void;
  onAction: (message: string) => void;
}> = ({ record, canManage, onClose, onAction }) => (
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
          <Info label="Issued" value={record.issued} />
          <Info label="Due" value={record.due} />
          <Info label="Owner" value={record.owner} />
          <Info label="Service" value={record.service} />
        </div>

        {record.warning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">Validation warning</div>
            <p className="mt-1">{record.warning}</p>
          </div>
        )}

        <Card title="Activity timeline">
          <ol className="space-y-3">
            {["Created from approved visit notes", "Rate schedule validated", "Sent to payer portal", "Awaiting finance review"].map((item) => (
              <li key={item} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">{item}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction(`${record.id} PDF export prepared in demo mode.`)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          {canManage && (
            <>
              <button
                onClick={() => onAction(`${record.id} opened for editing in demo mode.`)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Edit record
              </button>
              <button
                onClick={() => onAction(`${record.id} action posted to the demo ledger.`)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Banknote className="h-4 w-4" />
                Post action
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  </div>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
  </div>
);

const RevenueBreakdown: React.FC = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    <Card title="Revenue by payer" description="Current quarter">
      {[
        ["NDIS", 44],
        ["Aged Care", 26],
        ["Private", 18],
        ["Family", 12],
      ].map(([label, value]) => (
        <div key={label} className="mb-4 last:mb-0">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <span className="font-semibold text-slate-900">{value}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </Card>
    <Card title="Ageing summary" description="Outstanding balance bands">
      <div className="grid grid-cols-4 gap-3">
        {[
          ["0-14", "$18k"],
          ["15-30", "$9k"],
          ["31-60", "$4k"],
          ["60+", "$2k"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-4 text-center">
            <div className="font-display text-xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{label} days</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

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
