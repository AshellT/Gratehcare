import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Integration, PaginatedResponse } from "./types";

export const integrationsApi = {
  list: () =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Integration> | { items?: Integration[] }>(
            "/integrations",
          )
          .then(normalizePage),
      emptyPage<Integration>(),
    ),

  get: (id: string) =>
    apiClient.get<Integration>(`/integrations/${id}`),

  create: (data: {
    name: string;
    type: string;
    enabled: boolean;
    config: Record<string, any>;
  }) => apiClient.post<Integration>("/integrations", data as any),

  enable: (id: string) =>
    apiClient.post<Integration>(`/integrations/${id}/enable`, {}),

  disable: (id: string) =>
    apiClient.post<Integration>(`/integrations/${id}/disable`, {}),

  updateConfig: (id: string, config: Record<string, any>) =>
    apiClient.patch<Integration>(`/integrations/${id}/config`, { config } as any),

  delete: (id: string) =>
    apiClient.delete(`/integrations/${id}`),

  getLogs: (id: string) =>
    withFallback(
      () => apiClient.get<any[]>(`/integrations/${id}/logs`),
      [],
    ),
};
