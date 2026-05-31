import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type {
  ComplianceEvent,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

export const complianceApi = {
  listEvents: (
    query?: PaginationQuery & { status?: string; category?: string },
  ) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<ComplianceEvent> | { items?: ComplianceEvent[] }>(
            "/compliance",
            { params: query as any },
          )
          .then(normalizePage),
      emptyPage<ComplianceEvent>(),
    ),

  getEvent: (id: string) =>
    apiClient.get<ComplianceEvent>(`/compliance/${id}`),

  createEvent: (data: Partial<ComplianceEvent>) =>
    apiClient.post<ComplianceEvent>("/compliance", data as any),

  updateEvent: (id: string, data: Partial<ComplianceEvent>) =>
    apiClient.patch<ComplianceEvent>(`/compliance/${id}`, data as any),

  complete: (id: string) =>
    apiClient.patch<ComplianceEvent>(`/compliance/${id}/complete`, {}),
};
