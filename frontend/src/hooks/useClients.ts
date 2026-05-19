import { clientsApi } from "@/lib/api/clients";
import type {
  Client,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useClients(query?: PaginationQuery) {
  const state = useApi<PaginatedResponse<Client>>(
    () => clientsApi.list(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<Client>) => {
      const created = await clientsApi.create(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<Client>) => {
      const updated = await clientsApi.update(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  const remove = useCallback(
    async (id: string) => {
      await clientsApi.delete(id);
      state.refetch();
    },
    [state],
  );

  return { ...state, create, update, remove };
}
