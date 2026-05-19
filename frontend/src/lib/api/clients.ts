import { apiClient, withFallback } from "./client";
import type { Client, PaginatedResponse, PaginationQuery } from "./types";

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_CLIENTS: Client[] = [
  {
    id: "c-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Eleanor Rivers",
    initial: "ER",
    status: "active",
    funding: "NDIS · Plan-managed",
    coordinator: "Priya Raman",
    since: "Jan 2023",
    hoursPerWeek: 32,
    color: "from-indigo-500 to-sky-500",
    riskLevel: "high",
  },
  {
    id: "c-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Marcus Thompson",
    initial: "MT",
    status: "active",
    funding: "Self-funded",
    coordinator: "Daniel Wu",
    since: "Mar 2023",
    hoursPerWeek: 18,
    color: "from-rose-500 to-pink-500",
    riskLevel: "medium",
  },
  {
    id: "c-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Alana Williams",
    initial: "AW",
    status: "active",
    funding: "Insurance · Allianz",
    coordinator: "Priya Raman",
    since: "Jul 2023",
    hoursPerWeek: 24,
    color: "from-emerald-500 to-teal-500",
    riskLevel: "low",
  },
  {
    id: "c-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Henry Park",
    initial: "HP",
    status: "active",
    funding: "NDIS · Self-managed",
    coordinator: "James Okafor",
    since: "Sep 2023",
    hoursPerWeek: 28,
    color: "from-amber-500 to-orange-500",
    riskLevel: "medium",
  },
  {
    id: "c-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Maya Krishnan",
    initial: "MK",
    status: "onboarding",
    funding: "NDIS · Agency-managed",
    coordinator: "Sara Hill",
    since: "Nov 2025",
    color: "from-fuchsia-500 to-purple-500",
    riskLevel: "low",
  },
  {
    id: "c-006",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Olivier Chen",
    initial: "OC",
    status: "active",
    funding: "Aged Care Package",
    coordinator: "Tom Reed",
    since: "Feb 2024",
    hoursPerWeek: 16,
    color: "from-sky-500 to-cyan-500",
    riskLevel: "low",
  },
  {
    id: "c-007",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Nadia Hassan",
    initial: "NH",
    status: "paused",
    funding: "NDIS · Plan-managed",
    coordinator: "Priya Raman",
    since: "Apr 2024",
    hoursPerWeek: 0,
    color: "from-slate-500 to-slate-700",
    riskLevel: "medium",
  },
  {
    id: "c-008",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    fullName: "Ben Whitaker",
    initial: "BW",
    status: "active",
    funding: "Self-funded",
    coordinator: "Daniel Wu",
    since: "Jun 2024",
    hoursPerWeek: 12,
    color: "from-violet-500 to-indigo-500",
    riskLevel: "low",
  },
];

const MOCK_PAGE: PaginatedResponse<Client> = {
  data: MOCK_CLIENTS,
  total: MOCK_CLIENTS.length,
  page: 1,
  limit: 20,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const clientsApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Client>>("/clients", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  get: (id: string) =>
    withFallback(
      () => apiClient.get<Client>(`/clients/${id}`),
      MOCK_CLIENTS.find((c) => c.id === id) ?? MOCK_CLIENTS[0],
    ),

  create: (data: Partial<Client>) =>
    apiClient.post<Client>("/clients", data as any),

  update: (id: string, data: Partial<Client>) =>
    apiClient.patch<Client>(`/clients/${id}`, data as any),

  delete: (id: string) => apiClient.delete(`/clients/${id}`),
};
