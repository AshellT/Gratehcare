import { apiClient, normalizePage } from "./client";
import type { Incident, PaginatedResponse, PaginationQuery } from "./types";

type RawIncident = Partial<Incident> & {
  title?: string;
  details?: string;
  client?: { fullName?: string };
};

const normalizeIncidentStatus = (status?: string): Incident["status"] => {
  switch (String(status ?? "PENDING").toUpperCase()) {
    case "REVIEW":
      return "investigating";
    case "COMPLETED":
      return "resolved";
    case "ARCHIVED":
      return "closed";
    default:
      return "open";
  }
};

const normalizeIncident = (incident: RawIncident): Incident => ({
  ...(incident as Incident),
  reference: incident.reference ?? `INC-${incident.id?.slice(0, 8) ?? Date.now()}`,
  clientName: incident.clientName ?? incident.client?.fullName ?? "—",
  reportedBy: incident.reportedBy ?? "—",
  type: incident.type ?? "Incident",
  severity: String(incident.severity ?? "MEDIUM").toLowerCase() as Incident["severity"],
  status: normalizeIncidentStatus(incident.status),
  occurredAt: incident.occurredAt ?? new Date().toISOString(),
  summary: incident.summary ?? incident.title ?? incident.details ?? "Incident",
});

const normalizeIncidentPage = (page: PaginatedResponse<RawIncident> | { items?: RawIncident[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeIncident) };
};

export const incidentsApi = {
  list: (query?: PaginationQuery & { status?: string; severity?: string }) =>
    apiClient
      .get<
        PaginatedResponse<RawIncident> | {
          items?: RawIncident[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/incidents", { params: query as any })
      .then(normalizeIncidentPage),

  get: (id: string) => apiClient.get<RawIncident>(`/incidents/${id}`).then(normalizeIncident),

  create: (data: Partial<Incident>) =>
    apiClient.post<RawIncident>("/incidents", data as any).then(normalizeIncident),

  update: (id: string, data: Partial<Incident>) =>
    apiClient.patch<RawIncident>(`/incidents/${id}`, data as any).then(normalizeIncident),

  close: (id: string, resolution: string) =>
    apiClient.patch<RawIncident>(`/incidents/${id}/close`, { resolution } as any).then(normalizeIncident),
};
