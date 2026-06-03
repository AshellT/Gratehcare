import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, PaginationQuery, StaffMember } from "./types";

type RawStaff = Partial<StaffMember> & {
  title?: string;
  status?: string;
  user?: { fullName?: string; email?: string };
};

const normalizeStaffStatus = (status?: string): StaffMember["status"] => {
  switch (String(status ?? "ACTIVE").toUpperCase()) {
    case "ARCHIVED":
      return "inactive";
    case "REVIEW":
      return "on_leave";
    default:
      return "active";
  }
};

const normalizeStaff = (staff: RawStaff): StaffMember => {
  const fullName = staff.fullName ?? staff.user?.fullName ?? staff.title ?? "Staff member";
  return {
    ...(staff as StaffMember),
    fullName,
    email: staff.email ?? staff.user?.email ?? "",
    role: staff.role ?? "support_worker",
    status: normalizeStaffStatus(staff.status),
    hoursPerWeek: Number(staff.hoursPerWeek) || 0,
    skills: Array.isArray(staff.skills) ? staff.skills : [],
  };
};

const normalizeStaffPage = (page: PaginatedResponse<RawStaff> | { items?: RawStaff[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeStaff) };
};

export const staffApi = {
  list: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<RawStaff> | {
          items?: RawStaff[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/staff", { params: query as any })
      .then(normalizeStaffPage),

  get: (id: string) => apiClient.get<RawStaff>(`/staff/${id}`).then(normalizeStaff),

  create: (data: Partial<StaffMember>) =>
    apiClient.post<RawStaff>("/staff", data as any).then(normalizeStaff),

  update: (id: string, data: Partial<StaffMember>) =>
    apiClient.patch<RawStaff>(`/staff/${id}`, data as any).then(normalizeStaff),

  archive: (id: string) => apiClient.post(`/staff/${id}/archive`, {}),
};
