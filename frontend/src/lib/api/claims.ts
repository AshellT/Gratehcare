import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Claim, PaginatedResponse, PaginationQuery } from "./types";

export const claimsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Claim> | { items?: Claim[] }>("/claims", {
            params: query as any,
          })
          .then(normalizePage),
      emptyPage<Claim>(),
    ),

  get: (id: string) => apiClient.get<Claim>(`/claims/${id}`),

  create: (data: Partial<Claim>) => apiClient.post<Claim>("/claims", data as any),

  update: (id: string, data: Partial<Claim>) =>
    apiClient.patch<Claim>(`/claims/${id}`, data as any),
};
