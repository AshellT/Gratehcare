import { incidentsApi } from "@/lib/api/incidents";
import type {
  Incident,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useIncidents(
  query?: PaginationQuery & { status?: string; severity?: string },
) {
  const state = useApi<PaginatedResponse<Incident>>(
    () => incidentsApi.list(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<Incident>) => {
      const created = await incidentsApi.create(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<Incident>) => {
      const updated = await incidentsApi.update(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  const close = useCallback(
    async (id: string, resolution: string) => {
      await incidentsApi.close(id, resolution);
      state.refetch();
    },
    [state],
  );

  return { ...state, create, update, close };
}
