import { apiClient, withFallback } from "./client";
import type {
  ComplianceEvent,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

const MOCK_EVENTS: ComplianceEvent[] = [
  {
    id: "ce-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Police check renewal – James Okafor",
    category: "credential",
    dueDate: "2026-05-03",
    status: "pending",
    assignee: "James Okafor",
    severity: "critical",
  },
  {
    id: "ce-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Police check renewal – Alana Wong",
    category: "credential",
    dueDate: "2026-05-05",
    status: "in_progress",
    assignee: "Alana Wong",
    severity: "high",
  },
  {
    id: "ce-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "NDIS Worker Screening – Tom Reed",
    category: "credential",
    dueDate: "2026-05-10",
    status: "pending",
    assignee: "Tom Reed",
    severity: "high",
  },
  {
    id: "ce-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Manual handling training renewal",
    category: "training",
    dueDate: "2026-06-01",
    status: "pending",
    assignee: "Priya Raman",
    severity: "medium",
  },
  {
    id: "ce-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Annual policy review – Privacy Policy",
    category: "policy",
    dueDate: "2026-05-31",
    status: "in_progress",
    severity: "low",
  },
  {
    id: "ce-006",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Corrective action CAR-12 follow-up",
    category: "corrective_action",
    dueDate: "2026-04-30",
    status: "pending",
    severity: "high",
  },
];

const MOCK_PAGE: PaginatedResponse<ComplianceEvent> = {
  data: MOCK_EVENTS,
  total: MOCK_EVENTS.length,
  page: 1,
  limit: 20,
};

export const complianceApi = {
  listEvents: (
    query?: PaginationQuery & { status?: string; category?: string },
  ) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<ComplianceEvent>>("/compliance", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  getEvent: (id: string) =>
    withFallback(
      () => apiClient.get<ComplianceEvent>(`/compliance/${id}`),
      MOCK_EVENTS.find((e) => e.id === id) ?? MOCK_EVENTS[0],
    ),

  createEvent: (data: Partial<ComplianceEvent>) =>
    apiClient.post<ComplianceEvent>("/compliance", data as any),

  updateEvent: (id: string, data: Partial<ComplianceEvent>) =>
    apiClient.patch<ComplianceEvent>(`/compliance/${id}`, data as any),

  complete: (id: string) =>
    apiClient.patch<ComplianceEvent>(`/compliance/${id}/complete`, {}),
};
