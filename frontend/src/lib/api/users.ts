import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, User } from "./types";

export const usersApi = {
  list: (query?: PaginationQuery) =>
    apiClient
      .get<PaginatedResponse<User> | { items?: User[]; total?: number; page?: number; limit?: number }>("/users", {
        params: query as any,
      })
      .then(normalizePage),

  get: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  create: (data: { fullName: string; email: string; tenantId?: string }) =>
    apiClient.post<User>("/users", data as any),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data as any),

  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
