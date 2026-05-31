import { apiClient, withFallback } from "./client";

export type SystemHealth = {
  tenants: number;
  users: number;
  integrations: { enabled: number; total: number };
  openTickets: number;
  recentErrors: number;
  status: "healthy" | "degraded";
};

export const systemApi = {
  getHealth: () =>
    withFallback(
      () => apiClient.get<SystemHealth>("/system/health"),
      {
        tenants: 0,
        users: 0,
        integrations: { enabled: 0, total: 0 },
        openTickets: 0,
        recentErrors: 0,
        status: "healthy" as const,
      },
    ),
};
