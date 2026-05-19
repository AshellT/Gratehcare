import { apiClient, withFallback } from "./client";
import type { Invoice, PaginatedResponse, PaginationQuery } from "./types";

const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3421",
    clientName: "Eleanor Rivers",
    amount: 1240,
    currency: "AUD",
    issuedAt: "2026-04-02",
    dueAt: "2026-04-16",
    status: "paid",
  },
  {
    id: "inv-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3420",
    clientName: "Marcus Thompson",
    amount: 2180,
    currency: "AUD",
    issuedAt: "2026-04-02",
    dueAt: "2026-04-16",
    status: "pending",
  },
  {
    id: "inv-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3419",
    clientName: "Alana Williams",
    amount: 840,
    currency: "AUD",
    issuedAt: "2026-03-28",
    dueAt: "2026-04-12",
    status: "overdue",
  },
  {
    id: "inv-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3418",
    clientName: "Henry Park",
    amount: 1560,
    currency: "AUD",
    issuedAt: "2026-03-28",
    dueAt: "2026-04-12",
    status: "paid",
  },
  {
    id: "inv-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3417",
    clientName: "Maya Krishnan",
    amount: 420,
    currency: "AUD",
    issuedAt: "2026-03-25",
    dueAt: "2026-04-09",
    status: "paid",
  },
  {
    id: "inv-006",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3416",
    clientName: "Olivier Chen",
    amount: 960,
    currency: "AUD",
    issuedAt: "2026-03-25",
    dueAt: "2026-04-09",
    status: "pending",
  },
  {
    id: "inv-007",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    invoiceNumber: "INV-3415",
    clientName: "Ben Whitaker",
    amount: 680,
    currency: "AUD",
    issuedAt: "2026-03-21",
    dueAt: "2026-04-05",
    status: "paid",
  },
];

const MOCK_PAGE: PaginatedResponse<Invoice> = {
  data: MOCK_INVOICES,
  total: MOCK_INVOICES.length,
  page: 1,
  limit: 20,
};

export const billingApi = {
  listInvoices: (query?: PaginationQuery & { status?: string }) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Invoice>>("/billing", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  getInvoice: (id: string) =>
    withFallback(
      () => apiClient.get<Invoice>(`/billing/${id}`),
      MOCK_INVOICES.find((i) => i.id === id) ?? MOCK_INVOICES[0],
    ),

  createInvoice: (data: Partial<Invoice>) =>
    apiClient.post<Invoice>("/billing", data as any),

  updateInvoice: (id: string, data: Partial<Invoice>) =>
    apiClient.patch<Invoice>(`/billing/${id}`, data as any),

  markPaid: (id: string) =>
    apiClient.patch<Invoice>(`/billing/${id}/mark-paid`, {}),

  sendInvoice: (id: string) => apiClient.post(`/billing/${id}/send`, {}),

  getMockStats: () => ({
    outstanding: MOCK_INVOICES.filter(
      (i) => i.status === "pending" || i.status === "overdue",
    ).reduce((s, i) => s + i.amount, 0),
    paidThisMonth: MOCK_INVOICES.filter((i) => i.status === "paid").reduce(
      (s, i) => s + i.amount,
      0,
    ),
    overdue: MOCK_INVOICES.filter((i) => i.status === "overdue").length,
  }),
};
