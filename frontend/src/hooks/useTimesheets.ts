import { timesheetsApi } from "@/lib/api/timesheets";
import type {
  PaginatedResponse,
  PaginationQuery,
  Timesheet,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useTimesheets(query?: PaginationQuery & { status?: string }) {
  const state = useApi<PaginatedResponse<Timesheet>>(
    () => timesheetsApi.list(query),
    [JSON.stringify(query)],
  );

  const submit = useCallback(
    async (id: string) => {
      await timesheetsApi.submit(id);
      state.refetch();
    },
    [state],
  );

  const approve = useCallback(
    async (id: string) => {
      await timesheetsApi.approve(id);
      state.refetch();
    },
    [state],
  );

  const reject = useCallback(
    async (id: string, reason: string) => {
      await timesheetsApi.reject(id, reason);
      state.refetch();
    },
    [state],
  );

  return { ...state, submit, approve, reject };
}
