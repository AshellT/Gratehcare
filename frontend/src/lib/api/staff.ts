import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, StaffMember } from "./types";

export const staffApi = {
  list: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<StaffMember> | {
          items?: StaffMember[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/staff", { params: query as any })
      .then(normalizePage),

  get: (id: string) => apiClient.get<StaffMember>(`/staff/${id}`),

  create: (data: Partial<StaffMember>) =>
    apiClient.post<StaffMember>("/staff", data as any),

  update: (id: string, data: Partial<StaffMember>) =>
    apiClient.patch<StaffMember>(`/staff/${id}`, data as any),

  archive: (id: string) => apiClient.post(`/staff/${id}/archive`, {}),
};
