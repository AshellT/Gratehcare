import { apiClient, normalizePage } from "./client";
import type { Client, PaginatedResponse, PaginationQuery } from "./types";

export const clientsApi = {
  list: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<Client> | {
          items?: Client[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/clients", { params: query as any })
      .then(normalizePage),

  get: (id: string) => apiClient.get<Client>(`/clients/${id}`),

  create: (data: Partial<Client>) =>
    apiClient.post<Client>("/clients", data as any),

  update: (id: string, data: Partial<Client>) =>
    apiClient.patch<Client>(`/clients/${id}`, data as any),

  archive: (id: string) => apiClient.post(`/clients/${id}/archive`, {}),
};
