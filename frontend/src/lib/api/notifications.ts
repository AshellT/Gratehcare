import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import { API_BASE } from "./config";
import type { Notification, PaginatedResponse } from "./types";

export const notificationsApi = {
  list: () =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Notification> | { items?: Notification[] }>(
            "/notifications",
          )
          .then(normalizePage),
      emptyPage<Notification>(),
    ),

  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),

  markAllRead: () => apiClient.patch("/notifications/read-all", {}),

  dismiss: (id: string) => apiClient.delete(`/notifications/${id}`),

  streamUrl: (): string => `${API_BASE}/notifications/stream`,
};
