import { apiClient } from "./client";

export const rolesApi = {
  listPermissions: () =>
    apiClient.get<Record<string, string[]>>("/roles/permissions"),

  assign: (data: { userId: string; role: string; tenantId?: string }) =>
    apiClient.post("/roles/assign", data as any),
};
