import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, Timesheet } from "./types";

type RawTimesheet = Partial<Timesheet> & {
  hours?: number | string;
  status?: string;
  submittedAt?: string;
  staff?: { title?: string; user?: { fullName?: string } };
};

const normalizeTimesheetStatus = (status?: string): Timesheet["status"] => {
  switch (String(status ?? "PENDING").toUpperCase()) {
    case "REVIEW":
      return "submitted";
    case "APPROVED":
      return "approved";
    case "CANCELLED":
    case "ARCHIVED":
      return "rejected";
    default:
      return "draft";
  }
};

const normalizeTimesheet = (timesheet: RawTimesheet): Timesheet => ({
  ...(timesheet as Timesheet),
  staffName: timesheet.staffName ?? timesheet.staff?.user?.fullName ?? timesheet.staff?.title ?? "Staff member",
  weekStarting: timesheet.weekStarting ?? timesheet.submittedAt ?? new Date().toISOString(),
  hoursWorked: Number(timesheet.hoursWorked ?? timesheet.hours) || 0,
  mileage: timesheet.mileage != null ? Number(timesheet.mileage) : undefined,
  status: normalizeTimesheetStatus(timesheet.status),
});

const normalizeTimesheetPage = (page: PaginatedResponse<RawTimesheet> | { items?: RawTimesheet[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeTimesheet) };
};

export const timesheetsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    apiClient
      .get<
        PaginatedResponse<RawTimesheet> | {
          items?: RawTimesheet[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/timesheets", { params: query as any })
      .then(normalizeTimesheetPage),

  get: (id: string) => apiClient.get<RawTimesheet>(`/timesheets/${id}`).then(normalizeTimesheet),

  create: (data: Partial<Timesheet>) =>
    apiClient.post<RawTimesheet>("/timesheets", data as any).then(normalizeTimesheet),

  submit: (id: string) =>
    apiClient.patch<RawTimesheet>(`/timesheets/${id}/submit`, {}).then(normalizeTimesheet),

  approve: (id: string) =>
    apiClient.patch<RawTimesheet>(`/timesheets/${id}/approve`, {}).then(normalizeTimesheet),

  reject: (id: string, reason: string) =>
    apiClient.patch<RawTimesheet>(`/timesheets/${id}/reject`, { reason } as any).then(normalizeTimesheet),
};
