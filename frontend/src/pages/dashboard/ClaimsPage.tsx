import React, { useEffect, useState } from "react";
import { Plus, Download, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import { claimsApi } from "@/lib/api/claims";
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
  DRAFT: "slate",
  SUBMITTED: "indigo",
  REVIEW: "amber",
  APPROVED: "emerald",
  PAID: "emerald",
  REJECTED: "rose",
};

const money = (value: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(value),
  );

const ClaimsPage: React.FC = () => {
  const toast = useToast();
  const [claims, setClaims] = useState<RawClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await claimsApi.list({ limit: 50 });
        if (!mounted) return;
        setClaims((res.data ?? []) as unknown as RawClaim[]);
      } catch {
        if (mounted) toast.error("Failed to load claims", "Could not fetch claims from backend.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Claims"
        description="Submit, track and reconcile insurer and package claims."
        actions={[
          { label: "Export", variant: "secondary", icon: <Download className="h-4 w-4" /> },
          { label: "New claim", icon: <Plus className="h-4 w-4" /> },
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
              <li key={claim.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500">{claim.number}</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {claim.client?.fullName ?? "—"} · {claim.service ?? "Care services"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">Payer: {claim.payer ?? "—"}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-slate-900">{money(claim.amount)}</span>
                  <Badge tone={statusTone[claim.status] ?? "slate"} dot>
                    {claim.status.toLowerCase()}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ClaimsPage;
