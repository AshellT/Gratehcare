import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { PaginatedResponse, ReportSummary } from "./types";

export const reportsApi = {
  list: () =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<ReportSummary> | { items?: ReportSummary[] }>(
            "/reports",
          )
          .then(normalizePage),
      emptyPage<ReportSummary>(),
    ),

  generate: (type: string, params?: Record<string, string>) =>
    apiClient.post<ReportSummary>("/reports/generate", {
      type,
      ...params,
    } as any),

  download: (id: string) =>
    apiClient.get<{ id: string; title: string; type: string; payload: unknown; generatedAt: string }>(
      `/reports/${id}/download`,
    ),
};
