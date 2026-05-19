import { reportsApi } from "@/lib/api/reports";
import type { PaginatedResponse, ReportSummary } from "@/lib/api/types";
import { useApi } from "./useApi";

export function useReports() {
  return useApi<PaginatedResponse<ReportSummary>>(() => reportsApi.list(), []);
}
