import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, Tenant, User } from "./types";

export const tenantsApi = {
  list: () =>
    apiClient
      .get<PaginatedResponse<Tenant> | { items?: Tenant[]; total?: number; page?: number; limit?: number }>("/organizations")
      .then(normalizePage),

  create: (data: { name: string; slug: string; region?: string }) =>
    apiClient.post<Tenant>("/organizations", data as any),

  getCurrent: () =>
    apiClient.get<Tenant>("/organizations/current"),

  update: (data: Partial<Tenant>) =>
    apiClient.patch<Tenant>("/organizations/current", data as any),

  listUsers: () =>
    apiClient
      .get<PaginatedResponse<User> | { items?: User[]; total?: number; page?: number; limit?: number }>("/users")
      .then(normalizePage),

  inviteUser: (email: string, role: string) =>
    apiClient.post("/users/invite", { email, role } as any),
};
