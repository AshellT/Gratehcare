import { apiClient, withFallback } from "./client";
import { API_BASE } from "./config";
import type { Notification, PaginatedResponse } from "./types";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Shift update – Eleanor R.",
    body: "Evening shift 19:00 is now filled by Priya Raman.",
    type: "shift_update",
    severity: "info",
    readAt: undefined,
    sentAt: new Date(Date.now() - 3 * 60_000).toISOString(),
  },
  {
    id: "n-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Incident alert – Henry P.",
    body: "Second fall incident this week. Physio review required.",
    type: "incident_alert",
    severity: "critical",
    readAt: undefined,
    sentAt: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: "n-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Missed visit – Ben W.",
    body: "Scheduled 11:00 visit was not recorded in system.",
    type: "missed_visit",
    severity: "warning",
    readAt: undefined,
    sentAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: "n-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Compliance due – Police check",
    body: "James Okafor's police check expires in 5 days.",
    type: "compliance_alert",
    severity: "warning",
    readAt: new Date().toISOString(),
    sentAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
];

const MOCK_PAGE: PaginatedResponse<Notification> = {
  data: MOCK_NOTIFICATIONS,
  total: MOCK_NOTIFICATIONS.length,
  page: 1,
  limit: 20,
};

export const notificationsApi = {
  list: () =>
    withFallback(
      () => apiClient.get<PaginatedResponse<Notification>>("/notifications"),
      MOCK_PAGE,
    ),

  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),

  markAllRead: () => apiClient.patch("/notifications/read-all", {}),

  dismiss: (id: string) => apiClient.delete(`/notifications/${id}`),

  /** SSE stream URL — pass to EventSource directly */
  streamUrl: (): string => `${API_BASE}/notifications/stream`,
};
