import { apiClient, normalizePage } from "./client";
import type { Client, PaginatedResponse, PaginationQuery } from "./types";

type RawClient = Partial<Client> & {
  status?: string;
  riskLevel?: string;
  coordinatorUserId?: string;
  coordinator?: string | { id?: string; fullName?: string };
  familyLinks?: Array<{ user?: { fullName?: string; email?: string } }>;
  familyInviteSent?: boolean;
  familyLoginEmail?: string;
};

const normalizeStatus = (status?: string): Client["status"] => {
  switch (String(status ?? "ACTIVE").toUpperCase()) {
    case "PENDING":
      return "onboarding";
    case "REVIEW":
      return "paused";
    case "ARCHIVED":
      return "discharged";
    default:
      return "active";
  }
};

const coordinatorName = (client: RawClient): string | undefined => {
  if (typeof client.coordinator === "string" && client.coordinator.trim()) return client.coordinator;
  if (client.coordinator && typeof client.coordinator === "object") {
    return client.coordinator.fullName;
  }
  return undefined;
};

const normalizeClient = (client: RawClient): Client => {
  const fullName = client.fullName ?? "Client";
  return {
    ...(client as Client),
    fullName,
    initial: client.initial ?? fullName.charAt(0).toUpperCase(),
    status: normalizeStatus(client.status),
    funding: client.funding ?? "—",
    coordinator: coordinatorName(client),
    coordinatorUserId:
      client.coordinatorUserId ??
      (typeof client.coordinator === "object" ? client.coordinator?.id : undefined),
    familyName: client.familyName ?? client.familyLinks?.[0]?.user?.fullName,
    familyEmail: client.familyEmail ?? client.familyLoginEmail ?? client.familyLinks?.[0]?.user?.email,
    familyInviteSent: client.familyInviteSent,
    since: client.since ?? (client.createdAt ? new Date(client.createdAt).toLocaleDateString("en-AU") : "—"),
    riskLevel: client.riskLevel?.toLowerCase() as Client["riskLevel"],
  };
};

const normalizeClientPage = (page: PaginatedResponse<RawClient> | { items?: RawClient[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeClient) };
};

export const clientsApi = {
  list: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<RawClient> | {
          items?: RawClient[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/clients", { params: query as any })
      .then(normalizeClientPage),

  get: (id: string) => apiClient.get<RawClient>(`/clients/${id}`).then(normalizeClient),

  create: (data: Partial<Client>) =>
    apiClient.post<RawClient>("/clients", data as any).then(normalizeClient),

  update: (id: string, data: Partial<Client>) =>
    apiClient.patch<RawClient>(`/clients/${id}`, data as any).then(normalizeClient),

  archive: (id: string) => apiClient.post(`/clients/${id}/archive`, {}),
};
