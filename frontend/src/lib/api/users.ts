import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery, User } from "./types";

export const usersApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<User>>("/users", {
          params: query as any,
        }),
      { data: [], total: 0, page: 1, limit: 20 } as PaginatedResponse<User>,
    ),

  get: (id: string) =>
    withFallback(
      () => apiClient.get<User>(`/users/${id}`),
      null as unknown as User,
    ),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data as any),

  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
