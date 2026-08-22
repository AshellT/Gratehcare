import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Invoice, PaginatedResponse, PaginationQuery } from "./types";

type RawInvoice = Partial<Invoice> & {
  number?: string;
  status?: string;
  amount?: number | string;
  client?: { fullName?: string; funding?: string };
  clientId?: string;
  paidAt?: string | null;
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
    paidAt: invoice.paidAt ?? undefined,
    payer: invoice.payer ?? invoice.client?.funding ?? "—",
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

export type FinanceStripeStatus = {
  paymentsEnabled: boolean;
  waiting: boolean;
  publishableKey: string | null;
};

export type FinanceOverview = {
  stripe: FinanceStripeStatus;
  stats: {
    receivable: number;
    collected: number;
    overdue: number;
    openInvoices: number;
    claimsPipeline: number;
    claimsPaid: number;
    openClaims: number;
    revenue: number;
  };
  ageing: { current: number; days30: number; days60: number; days90: number };
  byPayer: { payer: string; amount: number; count: number }[];
  funding: {
    clientId: string;
    clientName: string;
    funding: string;
    billed: number;
    claimed: number;
    outstanding: number;
    status: string;
    since: string;
  }[];
};

export const billingApi = {
  listInvoices: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<RawInvoice> | { items?: RawInvoice[] }>("/billing", {
            params: { limit: 100, ...query } as any,
          })
          .then(normalizeInvoicePage),
      emptyPage<Invoice>(),
    ),

  getInvoice: (id: string) =>
    apiClient.get<RawInvoice>(`/billing/${id}`).then(normalizeInvoice),

  createInvoice: (data: Partial<Invoice> | Record<string, unknown>) =>
    apiClient.post<RawInvoice>("/billing", data as any).then(normalizeInvoice),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    apiClient.patch<RawInvoice>(`/billing/${id}`, data as any).then(normalizeInvoice),

  markPaid: (id: string) =>
    apiClient.patch<RawInvoice>(`/billing/${id}/mark-paid`, {}).then(normalizeInvoice),

  sendInvoice: (id: string) =>
    apiClient.post<RawInvoice>(`/billing/${id}/send`, {}).then(normalizeInvoice),

  overview: () => apiClient.get<FinanceOverview>("/finance/overview"),

  stripeStatus: () => apiClient.get<FinanceStripeStatus>("/finance/stripe-status"),

  createCheckout: (invoiceId: string) =>
    apiClient.post<{ url: string; sessionId: string; waiting?: boolean }>(
      `/finance/invoices/${invoiceId}/checkout`,
      {},
    ),

  confirmCheckout: (sessionId: string) =>
    apiClient.post<{ paid: boolean; invoiceId?: string; alreadyPaid?: boolean }>(
      "/finance/confirm-checkout",
      { sessionId },
    ),
};
