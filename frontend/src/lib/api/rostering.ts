import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery, Shift } from "./types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SHIFTS: Shift[] = [
  {
    id: "sh-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Eleanor Rivers",
    workerName: "Priya Raman",
    startTime: "2026-04-28T07:00:00Z",
    endTime: "2026-04-28T11:00:00Z",
    type: "personal_care",
    status: "filled",
    location: "Home",
  },
  {
    id: "sh-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Marcus Thompson",
    workerName: undefined,
    startTime: "2026-04-28T07:00:00Z",
    endTime: "2026-04-28T11:00:00Z",
    type: "personal_care",
    status: "open",
    location: "Day centre",
  },
  {
    id: "sh-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Eleanor Rivers",
    workerName: undefined,
    startTime: "2026-04-28T22:00:00Z",
    endTime: "2026-04-29T06:00:00Z",
    type: "overnight",
    status: "open",
    location: "Home",
  },
  {
    id: "sh-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Henry Park",
    workerName: "Daniel Wu",
    startTime: "2026-04-28T09:00:00Z",
    endTime: "2026-04-28T13:00:00Z",
    type: "personal_care",
    status: "filled",
    location: "Home",
  },
  {
    id: "sh-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Alana Williams",
    workerName: undefined,
    startTime: "2026-04-28T17:00:00Z",
    endTime: "2026-04-28T21:00:00Z",
    type: "therapy_support",
    status: "open",
    location: "Clinic",
  },
  {
    id: "sh-006",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Olivier Chen",
    workerName: "James Okafor",
    startTime: "2026-04-27T08:00:00Z",
    endTime: "2026-04-27T12:00:00Z",
    type: "personal_care",
    status: "completed",
    location: "Home",
  },
];

const MOCK_PAGE: PaginatedResponse<Shift> = {
  data: MOCK_SHIFTS,
  total: MOCK_SHIFTS.length,
  page: 1,
  limit: 50,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const rosteringApi = {
  listShifts: (query?: PaginationQuery & { date?: string; status?: string }) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Shift>>("/rostering", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  getShift: (id: string) =>
    withFallback(
      () => apiClient.get<Shift>(`/rostering/${id}`),
      MOCK_SHIFTS.find((s) => s.id === id) ?? MOCK_SHIFTS[0],
    ),

  createShift: (data: Partial<Shift>) =>
    apiClient.post<Shift>("/rostering", data as any),

  updateShift: (id: string, data: Partial<Shift>) =>
    apiClient.patch<Shift>(`/rostering/${id}`, data as any),

  assignWorker: (shiftId: string, workerId: string) =>
    apiClient.patch<Shift>(`/rostering/${shiftId}/assign`, { workerId } as any),

  deleteShift: (id: string) => apiClient.delete(`/rostering/${id}`),
};
