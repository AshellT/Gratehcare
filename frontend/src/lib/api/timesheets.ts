import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery, Timesheet } from "./types";

const MOCK_TIMESHEETS: Timesheet[] = [
  {
    id: "ts-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    staffName: "Priya Raman",
    weekStarting: "2026-04-21",
    hoursWorked: 38,
    mileage: 42,
    status: "approved",
  },
  {
    id: "ts-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    staffName: "Daniel Wu",
    weekStarting: "2026-04-21",
    hoursWorked: 32,
    mileage: 28,
    status: "submitted",
  },
  {
    id: "ts-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    staffName: "Sara Hill",
    weekStarting: "2026-04-21",
    hoursWorked: 54,
    mileage: 0,
    status: "submitted",
  },
  {
    id: "ts-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    staffName: "Tom Reed",
    weekStarting: "2026-04-21",
    hoursWorked: 40,
    status: "approved",
  },
  {
    id: "ts-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    staffName: "James Okafor",
    weekStarting: "2026-04-21",
    hoursWorked: 36,
    mileage: 55,
    status: "draft",
  },
];

const MOCK_PAGE: PaginatedResponse<Timesheet> = {
  data: MOCK_TIMESHEETS,
  total: MOCK_TIMESHEETS.length,
  page: 1,
  limit: 20,
};

export const timesheetsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Timesheet>>("/timesheets", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  get: (id: string) =>
    withFallback(
      () => apiClient.get<Timesheet>(`/timesheets/${id}`),
      MOCK_TIMESHEETS.find((t) => t.id === id) ?? MOCK_TIMESHEETS[0],
    ),

  create: (data: Partial<Timesheet>) =>
    apiClient.post<Timesheet>("/timesheets", data as any),

  submit: (id: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/submit`, {}),

  approve: (id: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    apiClient.patch<Timesheet>(`/timesheets/${id}/reject`, { reason } as any),
};
