import { billingApi } from "@/lib/api/billing";
import type {
  Invoice,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback, useMemo } from "react";
import { useApi } from "./useApi";

export function useBilling(query?: PaginationQuery & { status?: string }) {
  const state = useApi<PaginatedResponse<Invoice>>(
    () => billingApi.listInvoices(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<Invoice>) => {
      const created = await billingApi.createInvoice(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const markPaid = useCallback(
    async (id: string) => {
      await billingApi.markPaid(id);
      state.refetch();
    },
    [state],
  );

  const send = useCallback(
    async (id: string) => {
      await billingApi.sendInvoice(id);
      state.refetch();
    },
    [state],
  );

  const stats = useMemo(() => {
    const invoices = state.data?.data ?? [];
    return {
      outstanding: invoices
        .filter((i) => i.status === "pending" || i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + i.amount, 0),
      paidThisMonth: invoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.amount, 0),
      overdue: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [state.data]);

  return { ...state, create, markPaid, send, stats };
}
