import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, Shift } from "./types";

export const rosteringApi = {
  listShifts: (query?: PaginationQuery & { date?: string; status?: string }) =>
    apiClient
      .get<
        PaginatedResponse<Shift> | {
          items?: Shift[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/rostering", { params: query as any })
      .then(normalizePage),

  getShift: (id: string) => apiClient.get<Shift>(`/rostering/${id}`),

  createShift: (data: Partial<Shift>) =>
    apiClient.post<Shift>("/rostering", data as any),

  updateShift: (id: string, data: Partial<Shift>) =>
    apiClient.patch<Shift>(`/rostering/${id}`, data as any),

  assignWorker: (shiftId: string, workerId: string) =>
    apiClient.patch<Shift>(`/rostering/${shiftId}/assign`, { workerId } as any),

  deleteShift: (id: string) => apiClient.delete(`/rostering/${id}`),
};
