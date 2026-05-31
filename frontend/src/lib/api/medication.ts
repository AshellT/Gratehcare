import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery } from "./types";

export type MedicationRecord = {
  id: string;
  title?: string;
  clientId?: string;
  status?: string;
  createdAt?: string;
};

export const medicationApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<MedicationRecord> | { items?: MedicationRecord[] }>(
            "/medication",
            { params: query as any },
          )
          .then(normalizePage),
      emptyPage<MedicationRecord>(),
    ),

  create: (data: { title: string; description?: string; metadata?: Record<string, unknown> }) =>
    apiClient.post<MedicationRecord>("/medication", data as any),

  archive: (id: string) => apiClient.post(`/medication/${id}/archive`, {}),
};
