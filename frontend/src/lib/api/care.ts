import { apiClient, normalizePage } from "./client";
import type {
  CareNote,
  CarePlan,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

export const careApi = {
  listPlans: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<CarePlan> | {
          items?: CarePlan[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/care-plans", { params: query as any })
      .then(normalizePage),

  getPlan: (id: string) => apiClient.get<CarePlan>(`/care-plans/${id}`),

  createPlan: (data: Partial<CarePlan>) =>
    apiClient.post<CarePlan>("/care-plans", data as any),

  updatePlan: (id: string, data: Partial<CarePlan>) =>
    apiClient.patch<CarePlan>(`/care-plans/${id}`, data as any),

  listNotes: (
    query?: PaginationQuery & { clientId?: string; flaggedOnly?: boolean },
  ) =>
    apiClient
      .get<
        PaginatedResponse<CareNote> | {
          items?: CareNote[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/care-notes", { params: query as any })
      .then(normalizePage),

  createNote: (data: Partial<CareNote>) =>
    apiClient.post<CareNote>("/care-notes", data as any),

  updateNote: (id: string, data: Partial<CareNote>) =>
    apiClient.patch<CareNote>(`/care-notes/${id}`, data as any),
};
