import { useEffect, useState } from "react";
import { tenantsApi } from "@/lib/api/tenants";
import { usersApi } from "@/lib/api/users";
import { clientsApi } from "@/lib/api/clients";
import { staffApi } from "@/lib/api/staff";
import { billingApi } from "@/lib/api/billing";
import { complianceApi } from "@/lib/api/compliance";
import { auditLogsApi } from "@/lib/api/audit-logs";

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
  recentActivity: RoleHomeActivity[];
};

const empty: RoleHomeData = {
  loading: true,
  tenants: 0,
  users: 0,
  clients: 0,
  staff: 0,
  revenue: 0,
  openCompliance: 0,
  recentActivity: [],
};

export function useRoleHomeData(): RoleHomeData {
  const [data, setData] = useState<RoleHomeData>(empty);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tenants, users, clients, staff, invoices, compliance, logs] =
          await Promise.all([
            tenantsApi.list().catch(() => ({ data: [], total: 0 })),
            usersApi.list().catch(() => ({ data: [], total: 0 })),
            clientsApi.list().catch(() => ({ data: [], total: 0 })),
            staffApi.list().catch(() => ({ data: [], total: 0 })),
            billingApi.listInvoices().catch(() => ({ data: [], total: 0 })),
            complianceApi.listEvents().catch(() => ({ data: [], total: 0 })),
            auditLogsApi.list({ limit: 4 }).catch(() => ({ data: [] })),
          ]);

        if (!mounted) return;

        const revenue = (invoices.data ?? [])
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + i.amount, 0);

        setData({
          loading: false,
          tenants: tenants.total ?? tenants.data?.length ?? 0,
          users: users.total ?? users.data?.length ?? 0,
          clients: clients.total ?? clients.data?.length ?? 0,
          staff: staff.total ?? staff.data?.length ?? 0,
          revenue,
          openCompliance: (compliance.data ?? []).filter(
            (e) => e.status === "pending" || e.status === "in_progress",
          ).length,
          recentActivity: (logs.data ?? []).slice(0, 4).map((log: any) => ({
            id: String(log.id ?? log.action ?? Math.random()),
            title: log.action ?? log.summary ?? "Activity",
            time: log.createdAt ?? "—",
          })),
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
