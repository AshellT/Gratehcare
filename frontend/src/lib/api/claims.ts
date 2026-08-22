import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Claim, PaginatedResponse, PaginationQuery } from "./types";

type RawClaim = Partial<Claim> & {
  amount?: number | string;
  status?: string;
  client?: { fullName?: string };
};

const normalizeClaim = (claim: RawClaim): Claim => ({
  ...(claim as Claim),
  number: claim.number ?? claim.id ?? "",
  clientName: claim.clientName ?? claim.client?.fullName ?? "—",
  payer: claim.payer ?? "—",
  service: claim.service ?? "Care services",
  amount: Number(claim.amount) || 0,
  status: String(claim.status ?? "DRAFT").toLowerCase() as Claim["status"],
  submittedAt: claim.submittedAt,
  paidAt: claim.paidAt,
  client: claim.client,
});

const normalizeClaimPage = (page: PaginatedResponse<RawClaim> | { items?: RawClaim[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeClaim) };
};

export const claimsApi = {
  list: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<RawClaim> | { items?: RawClaim[] }>("/claims", {
            params: { limit: 100, ...query } as any,
          })
          .then(normalizeClaimPage),
      emptyPage<Claim>(),
    ),

  get: (id: string) => apiClient.get<RawClaim>(`/claims/${id}`).then(normalizeClaim),

  create: (data: Partial<Claim> | Record<string, unknown>) =>
    apiClient.post<RawClaim>("/claims", data as any).then(normalizeClaim),

  update: (id: string, data: Partial<Claim> | Record<string, unknown>) =>
    apiClient.patch<RawClaim>(`/claims/${id}`, data as any).then(normalizeClaim),

  setStatus: (id: string, status: string) =>
    apiClient
      .patch<RawClaim>(`/claims/${id}/status`, { status: status.toUpperCase() })
      .then(normalizeClaim),
};
