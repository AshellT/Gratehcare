import { careApi } from "@/lib/api/care";
import type {
  CareNote,
  CarePlan,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useCarePlans(query?: PaginationQuery) {
  const state = useApi<PaginatedResponse<CarePlan>>(
    () => careApi.listPlans(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<CarePlan>) => {
      const created = await careApi.createPlan(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<CarePlan>) => {
      const updated = await careApi.updatePlan(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  return { ...state, create, update };
}

export function useCareNotes(
  query?: PaginationQuery & { clientId?: string; flaggedOnly?: boolean },
) {
  const state = useApi<PaginatedResponse<CareNote>>(
    () => careApi.listNotes(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<CareNote>) => {
      const created = await careApi.createNote(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<CareNote>) => {
      const updated = await careApi.updateNote(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  return { ...state, create, update };
}
