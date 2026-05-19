import { complianceApi } from "@/lib/api/compliance";
import type {
  ComplianceEvent,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useCompliance(
  query?: PaginationQuery & { status?: string; category?: string },
) {
  const state = useApi<PaginatedResponse<ComplianceEvent>>(
    () => complianceApi.listEvents(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<ComplianceEvent>) => {
      const created = await complianceApi.createEvent(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<ComplianceEvent>) => {
      const updated = await complianceApi.updateEvent(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  const complete = useCallback(
    async (id: string) => {
      await complianceApi.complete(id);
      state.refetch();
    },
    [state],
  );

  return { ...state, create, update, complete };
}
