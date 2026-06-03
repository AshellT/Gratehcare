import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Invoice, PaginatedResponse, PaginationQuery } from "./types";

type RawInvoice = Partial<Invoice> & {
  number?: string;
  status?: string;
  amount?: number | string;
  client?: { fullName?: string };
};

const normalizeInvoice = (invoice: RawInvoice): Invoice => {
  const status = String(invoice.status ?? "DRAFT").toLowerCase();
  return {
    ...(invoice as Invoice),
    invoiceNumber: invoice.invoiceNumber ?? invoice.number ?? invoice.id,
    clientName: invoice.clientName ?? invoice.client?.fullName ?? "—",
    amount: Number(invoice.amount) || 0,
    currency: invoice.currency ?? "AUD",
    issuedAt: invoice.issuedAt ?? new Date().toISOString(),
    dueAt: invoice.dueAt ?? invoice.issuedAt ?? new Date().toISOString(),
    status: status === "void" ? "cancelled" : (status as Invoice["status"]),
  };
};

const normalizeInvoicePage = (page: PaginatedResponse<RawInvoice> | { items?: RawInvoice[] }) => {
  const normalized = normalizePage(page);
  return {
    ...normalized,
    data: normalized.data.map(normalizeInvoice),
  };
};

export const billingApi = {
  listInvoices: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<RawInvoice> | { items?: RawInvoice[] }>("/billing", {
            params: query as any,
          })
          .then(normalizeInvoicePage),
      emptyPage<Invoice>(),
    ),

  getInvoice: (id: string) =>
    apiClient.get<RawInvoice>(`/billing/${id}`).then(normalizeInvoice),

  createInvoice: (data: Partial<Invoice>) =>
    apiClient.post<RawInvoice>("/billing", data as any).then(normalizeInvoice),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    apiClient.patch<RawInvoice>(`/billing/${id}`, data as any).then(normalizeInvoice),

  markPaid: (id: string) =>
    apiClient.patch<RawInvoice>(`/billing/${id}/mark-paid`, {}).then(normalizeInvoice),

  sendInvoice: (id: string) =>
    apiClient.post<RawInvoice>(`/billing/${id}/send`, {}).then(normalizeInvoice),
};
