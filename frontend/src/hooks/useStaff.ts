import { staffApi } from "@/lib/api/staff";
import type {
  PaginatedResponse,
  PaginationQuery,
  StaffMember,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useStaff(query?: PaginationQuery) {
  const state = useApi<PaginatedResponse<StaffMember>>(
    () => staffApi.list(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (data: Partial<StaffMember>) => {
      const created = await staffApi.create(data);
      state.refetch();
      return created;
    },
    [state],
  );

  const update = useCallback(
    async (id: string, data: Partial<StaffMember>) => {
      const updated = await staffApi.update(id, data);
      state.refetch();
      return updated;
    },
    [state],
  );

  const remove = useCallback(
    async (id: string) => {
      await staffApi.archive(id);
      state.refetch();
    },
    [state],
  );

  return { ...state, create, update, remove };
}
