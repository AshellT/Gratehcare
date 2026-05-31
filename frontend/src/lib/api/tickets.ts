import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery, SupportTicket } from "./types";

export const ticketsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<SupportTicket> | { items?: SupportTicket[] }>("/tickets", {
            params: query as any,
          })
          .then(normalizePage),
      emptyPage<SupportTicket>(),
    ),

  get: (id: string) => apiClient.get<SupportTicket>(`/tickets/${id}`),

  create: (data: Partial<SupportTicket>) =>
    apiClient.post<SupportTicket>("/tickets", data as any),

  update: (id: string, data: Partial<SupportTicket>) =>
    apiClient.patch<SupportTicket>(`/tickets/${id}`, data as any),
};
