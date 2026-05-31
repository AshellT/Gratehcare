import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, Timesheet } from "./types";

export const timesheetsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    apiClient
      .get<
        PaginatedResponse<Timesheet> | {
          items?: Timesheet[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/timesheets", { params: query as any })
      .then(normalizePage),

  get: (id: string) => apiClient.get<Timesheet>(`/timesheets/${id}`),

  create: (data: Partial<Timesheet>) =>
    apiClient.post<Timesheet>("/timesheets", data as any),

  submit: (id: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/submit`, {}),

  approve: (id: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/reject`, { reason } as any),
};
