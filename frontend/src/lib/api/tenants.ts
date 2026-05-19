import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, Tenant, User } from "./types";

const MOCK_TENANT: Tenant = {
  id: "t-demo",
  tenantId: "t-demo",
  createdAt: "",
  updatedAt: "",
  name: "GratehCare Demo Org",
  slug: "demo",
  plan: "professional",
  status: "active",
};

export const tenantsApi = {
  getCurrent: () =>
    withFallback(
      () => apiClient.get<Tenant>("/organizations/current"),
      MOCK_TENANT,
    ),

  update: (data: Partial<Tenant>) =>
    apiClient.patch<Tenant>("/organizations/current", data as any),

  listUsers: () =>
    withFallback(() => apiClient.get<PaginatedResponse<User>>("/users"), {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    } as PaginatedResponse<User>),

  inviteUser: (email: string, role: string) =>
    apiClient.post("/users/invite", { email, role } as any),
};
