import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Invoice, PaginatedResponse, PaginationQuery } from "./types";

export const billingApi = {
  listInvoices: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Invoice> | { items?: Invoice[] }>("/billing", {
            params: query as any,
          })
          .then(normalizePage),
      emptyPage<Invoice>(),
    ),

  getInvoice: (id: string) =>
    apiClient.get<Invoice>(`/billing/${id}`),

  createInvoice: (data: Partial<Invoice>) =>
    apiClient.post<Invoice>("/billing", data as any),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    apiClient.patch<Invoice>(`/billing/${id}`, data as any),

  markPaid: (id: string) =>
    apiClient.patch<Invoice>(`/billing/${id}/mark-paid`, {}),

  sendInvoice: (id: string) => apiClient.post(`/billing/${id}/send`, {}),
};
