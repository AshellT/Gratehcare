import { apiClient, withFallback } from "./client";
import type { Incident, PaginatedResponse, PaginationQuery } from "./types";

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    reference: "INC-481",
    clientName: "Henry Park",
    reportedBy: "James Okafor",
    type: "Fall",
    severity: "medium",
    status: "investigating",
    occurredAt: "2026-04-25T14:30:00Z",
    summary:
      "Client fell in bathroom during personal care visit. No serious injury but monitoring required.",
  },
  {
    id: "inc-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    reference: "INC-482",
    clientName: "Henry Park",
    reportedBy: "James Okafor",
    type: "Fall",
    severity: "high",
    status: "open",
    occurredAt: "2026-04-28T09:00:00Z",
    summary:
      "Second fall incident in 3 days. Physio assessment urgently required.",
  },
  {
    id: "inc-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    reference: "INC-479",
    clientName: "Eleanor Rivers",
    reportedBy: "Priya Raman",
    type: "Medication error",
    severity: "medium",
    status: "resolved",
    occurredAt: "2026-04-20T08:00:00Z",
    summary:
      "Wrong dosage administered. Reviewed with prescriber. Protocol updated.",
  },
  {
    id: "inc-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    reference: "INC-475",
    clientName: "Marcus Thompson",
    reportedBy: "Daniel Wu",
    type: "Behaviour",
    severity: "low",
    status: "closed",
    occurredAt: "2026-04-15T16:00:00Z",
    summary:
      "Client refused personal care and became verbally agitated. Carer used de-escalation techniques.",
  },
];

const MOCK_PAGE: PaginatedResponse<Incident> = {
  data: MOCK_INCIDENTS,
  total: MOCK_INCIDENTS.length,
  page: 1,
  limit: 20,
};

export const incidentsApi = {
  list: (query?: PaginationQuery & { status?: string; severity?: string }) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Incident>>("/incidents", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  get: (id: string) =>
    withFallback(
      () => apiClient.get<Incident>(`/incidents/${id}`),
      MOCK_INCIDENTS.find((i) => i.id === id) ?? MOCK_INCIDENTS[0],
    ),

  create: (data: Partial<Incident>) =>
    apiClient.post<Incident>("/incidents", data as any),

  update: (id: string, data: Partial<Incident>) =>
    apiClient.patch<Incident>(`/incidents/${id}`, data as any),

  close: (id: string, resolution: string) =>
    apiClient.patch<Incident>(`/incidents/${id}/close`, { resolution } as any),
};
