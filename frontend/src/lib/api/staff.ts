import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery, StaffMember } from "./types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STAFF: StaffMember[] = [
  {
    id: "s-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Priya Raman",
    email: "priya@demo.test",
    role: "care_coordinator",
    status: "active",
    hoursPerWeek: 38,
    skills: ["manual_handling", "medication"],
    satisfactionScore: 4.9,
  },
  {
    id: "s-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Daniel Wu",
    email: "daniel@demo.test",
    role: "support_worker",
    status: "active",
    hoursPerWeek: 32,
    skills: ["personal_care"],
    satisfactionScore: 4.8,
  },
  {
    id: "s-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Sara Hill",
    email: "sara@demo.test",
    role: "operations_admin",
    status: "active",
    hoursPerWeek: 54,
    skills: ["rostering"],
    satisfactionScore: 4.9,
  },
  {
    id: "s-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Tom Reed",
    email: "tom@demo.test",
    role: "billing_officer",
    status: "active",
    hoursPerWeek: 40,
    skills: ["ndis_billing"],
    satisfactionScore: 4.7,
  },
  {
    id: "s-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "James Okafor",
    email: "james@demo.test",
    role: "support_worker",
    status: "active",
    hoursPerWeek: 36,
    skills: ["personal_care", "manual_handling"],
    credentialsExpiry: "2026-05-03",
  },
  {
    id: "s-006",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Alana Wong",
    email: "alana@demo.test",
    role: "support_worker",
    status: "on_leave",
    hoursPerWeek: 0,
    skills: ["therapy_support"],
  },
];

const MOCK_PAGINATED_STAFF: PaginatedResponse<StaffMember> = {
  data: MOCK_STAFF,
  total: MOCK_STAFF.length,
  page: 1,
  limit: 20,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const staffApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<StaffMember>>("/staff", {
          params: query as any,
        }),
      MOCK_PAGINATED_STAFF,
    ),

  get: (id: string) =>
    withFallback(
      () => apiClient.get<StaffMember>(`/staff/${id}`),
      MOCK_STAFF.find((s) => s.id === id) ?? MOCK_STAFF[0],
    ),

  create: (data: Partial<StaffMember>) =>
    apiClient.post<StaffMember>("/staff", data as any),

  update: (id: string, data: Partial<StaffMember>) =>
    apiClient.patch<StaffMember>(`/staff/${id}`, data as any),

  delete: (id: string) => apiClient.delete(`/staff/${id}`),
};
