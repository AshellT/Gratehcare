import { rosteringApi } from "@/lib/api/rostering";
import type {
  PaginatedResponse,
  PaginationQuery,
  Shift,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useRostering(
  query?: PaginationQuery & { date?: string; status?: string },
) {
  const state = useApi<PaginatedResponse<Shift>>(
    () => rosteringApi.listShifts(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<Shift>) => {
      const created = await rosteringApi.createShift(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<Shift>) => {
      const updated = await rosteringApi.updateShift(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  const assign = useCallback(
    async (shiftId: string, workerId: string) => {
      const updated = await rosteringApi.assignWorker(shiftId, workerId);
      state.refetch();
      return updated;
    },
    [state],
  );

  const remove = useCallback(
    async (id: string) => {
      await rosteringApi.deleteShift(id);
      state.refetch();
    },
    [state],
  );

  return { ...state, create, update, assign, remove };
}
