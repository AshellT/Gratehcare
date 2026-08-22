import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery } from "./types";

export type StaffCredential = {
  id: string;
  tenantId: string;
  staffId: string;
  type: string;
  title: string;
  category: string;
  expiresAt?: string | null;
  status: string;
  severity: string;
  staffName: string;
};

export const credentialsApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<StaffCredential> | { items?: StaffCredential[] }>("/credentials", {
            params: { limit: 100, ...query } as any,
          })
          .then(normalizePage),
      emptyPage<StaffCredential>(),
    ),

  create: (data: { staffId: string; type: string; expiresAt?: string }) =>
    apiClient.post<StaffCredential>("/credentials", data as any),
};
