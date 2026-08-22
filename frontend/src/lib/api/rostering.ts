import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, Shift } from "./types";

type RawShift = Partial<Shift> & {
  startsAt?: string;
  endsAt?: string;
  service?: string;
  status?: string;
  client?: { fullName?: string };
  staff?: { title?: string; user?: { fullName?: string } };
  staffId?: string;
  clientId?: string;
};

const normalizeShiftStatus = (status?: string): Shift["status"] => {
  switch (String(status ?? "OPEN").toUpperCase()) {
    case "FILLED":
      return "filled";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "MISSED":
      return "missed";
    default:
      return "open";
  }
};

const normalizeShift = (shift: RawShift): Shift => ({
  ...(shift as Shift),
  clientName: shift.clientName ?? shift.client?.fullName ?? "Client",
  workerName: shift.workerName ?? shift.staff?.user?.fullName ?? shift.staff?.title,
  staffId: shift.staffId,
  clientId: shift.clientId,
  startTime: shift.startTime ?? shift.startsAt ?? new Date().toISOString(),
  endTime: shift.endTime ?? shift.endsAt ?? new Date().toISOString(),
  type: shift.type ?? shift.service ?? "Shift",
  status: normalizeShiftStatus(shift.status),
  location: shift.location ?? "—",
});

const normalizeShiftPage = (page: PaginatedResponse<RawShift> | { items?: RawShift[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeShift) };
};

export const rosteringApi = {
  listShifts: (query?: PaginationQuery & { date?: string; status?: string }) =>
    apiClient
      .get<
        PaginatedResponse<RawShift> | {
          items?: RawShift[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/rostering", { params: query as any })
      .then(normalizeShiftPage),

  getShift: (id: string) => apiClient.get<RawShift>(`/rostering/${id}`).then(normalizeShift),

  createShift: (data: Partial<Shift>) =>
    apiClient.post<RawShift>("/rostering", data as any).then(normalizeShift),

  updateShift: (id: string, data: Partial<Shift>) =>
    apiClient.patch<RawShift>(`/rostering/${id}`, data as any).then(normalizeShift),

  assignWorker: (shiftId: string, workerId: string) =>
    apiClient.patch<RawShift>(`/rostering/${shiftId}/assign`, { workerId } as any).then(normalizeShift),

  archiveShift: (id: string) => apiClient.post(`/rostering/${id}/archive`, {}),
};
