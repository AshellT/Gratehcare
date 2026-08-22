import { useEffect, useState } from "react";
import { tenantsApi } from "@/lib/api/tenants";
import { usersApi } from "@/lib/api/users";
import { clientsApi } from "@/lib/api/clients";
import { staffApi } from "@/lib/api/staff";
import { billingApi } from "@/lib/api/billing";
import { complianceApi } from "@/lib/api/compliance";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { rosteringApi } from "@/lib/api/rostering";
import type { Alert } from "@/components/dashboard/widgets/AlertsWidget";
import type { WorkQueueItem } from "@/components/dashboard/widgets/WorkQueue";

export type RoleHomeActivity = {
  id: string;
  title: string;
  time: string;
};

export type RoleHomeData = {
  loading: boolean;
  tenants: number;
  users: number;
  clients: number;
  staff: number;
  revenue: number;
  openCompliance: number;
  openShifts: number;
  overdue: number;
  recentActivity: RoleHomeActivity[];
  alerts: Alert[];
  queue: WorkQueueItem[];
};

const empty: RoleHomeData = {
  loading: true,
  tenants: 0,
  users: 0,
  clients: 0,
  staff: 0,
  revenue: 0,
  openCompliance: 0,
  openShifts: 0,
  overdue: 0,
  recentActivity: [],
  alerts: [],
  queue: [],
};

export function useRoleHomeData(): RoleHomeData {
  const [data, setData] = useState<RoleHomeData>(empty);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tenants, users, clients, staff, finance, compliance, logs, openShifts] =
          await Promise.all([
            tenantsApi.list().catch(() => ({ data: [], total: 0 })),
            usersApi.list().catch(() => ({ data: [], total: 0 })),
            clientsApi.list({ limit: 100 }).catch(() => ({ data: [], total: 0 })),
            staffApi.list({ limit: 100 }).catch(() => ({ data: [], total: 0 })),
            billingApi.overview().catch(() => null),
            complianceApi.listEvents().catch(() => ({ data: [], total: 0 })),
            auditLogsApi.list({ limit: 4 }).catch(() => ({ data: [] })),
            rosteringApi.listShifts({ status: "open", limit: 100 }).catch(() => ({ data: [] })),
          ]);

        if (!mounted) return;

        const revenue = finance?.stats.revenue ?? 0;
        const overdue = finance?.stats.overdue ?? 0;
        const openInvoiceCount = finance?.stats.openInvoices ?? 0;
        const openShiftCount = openShifts.data?.length ?? 0;
        const openCompliance = (compliance.data ?? []).filter(
          (e) => e.status === "pending" || e.status === "in_progress",
        ).length;

        const alerts: Alert[] = [];
        const queue: WorkQueueItem[] = [];

        if (openShiftCount > 0) {
          alerts.push({
            id: "open-shifts",
            severity: "warning",
            title: `${openShiftCount} open shift${openShiftCount === 1 ? "" : "s"}`,
            description: "Unfilled roster slots still need a worker.",
            cta: "Review open shifts",
          });
          queue.push({
            id: "open-shifts",
            primary: `${openShiftCount} open shift${openShiftCount === 1 ? "" : "s"} to fill`,
            secondary: "Rostering",
            badge: { label: "Roster", tone: "amber" },
          });
        }

        if (overdue > 0 || openInvoiceCount > 0) {
          alerts.push({
            id: "overdue",
            severity: overdue > 0 ? "critical" : "warning",
            title:
              overdue > 0
                ? `$${overdue.toLocaleString()} overdue`
                : `${openInvoiceCount} open invoice${openInvoiceCount === 1 ? "" : "s"}`,
            description: "Follow up outstanding invoices and claims.",
            cta: "Open invoices",
          });
          queue.push({
            id: "overdue",
            primary:
              overdue > 0
                ? `$${overdue.toLocaleString()} overdue invoices`
                : `${openInvoiceCount} invoices awaiting payment`,
            secondary: "Finance",
            badge: { label: "Billing", tone: overdue > 0 ? "rose" : "indigo" },
          });
        }

        if (openCompliance > 0) {
          alerts.push({
            id: "compliance",
            severity: "warning",
            title: `${openCompliance} open compliance item${openCompliance === 1 ? "" : "s"}`,
            description: "Risks, credentials or investigations still need action.",
            cta: "Open compliance",
          });
          queue.push({
            id: "compliance",
            primary: `${openCompliance} compliance item${openCompliance === 1 ? "" : "s"} open`,
            secondary: "Quality",
            badge: { label: "Compliance", tone: "sky" },
          });
        }

        setData({
          loading: false,
          tenants: tenants.total ?? tenants.data?.length ?? 0,
          users: users.total ?? users.data?.length ?? 0,
          clients: clients.total ?? clients.data?.length ?? 0,
          staff: staff.total ?? staff.data?.length ?? 0,
          revenue,
          openCompliance,
          openShifts: openShiftCount,
          overdue,
          recentActivity: (logs.data ?? []).slice(0, 4).map((log: any) => ({
            id: String(log.id ?? log.action ?? Math.random()),
            title: log.action ?? log.summary ?? "Activity",
            time: log.createdAt ?? "—",
          })),
          alerts,
          queue,
        });
      } catch {
        if (mounted) setData((current) => ({ ...current, loading: false }));
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}
