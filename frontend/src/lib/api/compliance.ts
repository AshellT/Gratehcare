import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type {
  ComplianceEvent,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

type RawComplianceEvent = Partial<ComplianceEvent> & {
  dueAt?: string;
  status?: string;
  severity?: string;
};

const normalizeStatus = (status?: string): ComplianceEvent["status"] => {
  switch (String(status ?? "PENDING").toUpperCase()) {
    case "REVIEW":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    case "ARCHIVED":
      return "overdue";
    default:
      return "pending";
  }
};

const normalizeComplianceEvent = (event: RawComplianceEvent): ComplianceEvent => ({
  ...(event as ComplianceEvent),
  title: event.title ?? "Compliance event",
  category: event.category ?? "General",
  dueDate: event.dueDate ?? event.dueAt ?? new Date().toISOString(),
  status: normalizeStatus(event.status),
  severity: String(event.severity ?? "MEDIUM").toLowerCase() as ComplianceEvent["severity"],
});

const normalizeCompliancePage = (
  page: PaginatedResponse<RawComplianceEvent> | { items?: RawComplianceEvent[] },
) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeComplianceEvent) };
};

export const complianceApi = {
  listEvents: (
    query?: PaginationQuery & { status?: string; category?: string },
  ) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<RawComplianceEvent> | { items?: RawComplianceEvent[] }>(
            "/compliance",
            { params: query as any },
          )
          .then(normalizeCompliancePage),
      emptyPage<ComplianceEvent>(),
    ),

  getEvent: (id: string) =>
    apiClient.get<RawComplianceEvent>(`/compliance/${id}`).then(normalizeComplianceEvent),

  createEvent: (data: Partial<ComplianceEvent>) =>
    apiClient.post<RawComplianceEvent>("/compliance", data as any).then(normalizeComplianceEvent),

  updateEvent: (id: string, data: Partial<ComplianceEvent>) =>
    apiClient.patch<RawComplianceEvent>(`/compliance/${id}`, data as any).then(normalizeComplianceEvent),

  complete: (id: string) =>
    apiClient.patch<RawComplianceEvent>(`/compliance/${id}/complete`, {}).then(normalizeComplianceEvent),
};
