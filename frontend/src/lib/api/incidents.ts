import { apiClient, normalizePage } from "./client";
import type { Incident, PaginatedResponse, PaginationQuery } from "./types";

export const incidentsApi = {
  list: (query?: PaginationQuery & { status?: string; severity?: string }) =>
    apiClient
      .get<
        PaginatedResponse<Incident> | {
          items?: Incident[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/incidents", { params: query as any })
      .then(normalizePage),

  get: (id: string) => apiClient.get<Incident>(`/incidents/${id}`),

  create: (data: Partial<Incident>) =>
    apiClient.post<Incident>("/incidents", data as any),

  update: (id: string, data: Partial<Incident>) =>
    apiClient.patch<Incident>(`/incidents/${id}`, data as any),

  close: (id: string, resolution: string) =>
    apiClient.patch<Incident>(`/incidents/${id}/close`, { resolution } as any),
};
