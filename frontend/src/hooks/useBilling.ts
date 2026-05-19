import { billingApi } from "@/lib/api/billing";
import type {
  Invoice,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
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

  const stats = billingApi.getMockStats();

  return { ...state, create, markPaid, send, stats };
}
