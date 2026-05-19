import { apiClient, withFallback } from "./client";
import type { PaginatedResponse, ReportSummary } from "./types";

const MOCK_REPORTS: ReportSummary[] = [
  {
    id: "rpt-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Monthly Activity Report – March 2026",
    type: "activity",
    generatedAt: "2026-04-02T08:00:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "rpt-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Billing Summary – Q1 2026",
    type: "billing",
    generatedAt: "2026-04-05T08:00:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "rpt-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Staff Performance – March 2026",
    type: "staff",
    generatedAt: "2026-04-03T08:00:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "rpt-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Compliance Status Report",
    type: "compliance",
    generatedAt: "2026-04-07T08:00:00Z",
    status: "ready",
    downloadUrl: "#",
  },
  {
    id: "rpt-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    title: "Incident Summary – Q1 2026",
    type: "incidents",
    generatedAt: "2026-04-04T08:00:00Z",
    status: "ready",
    downloadUrl: "#",
  },
];

const MOCK_PAGE: PaginatedResponse<ReportSummary> = {
  data: MOCK_REPORTS,
  total: MOCK_REPORTS.length,
  page: 1,
  limit: 20,
};

export const reportsApi = {
  list: () =>
    withFallback(
      () => apiClient.get<PaginatedResponse<ReportSummary>>("/reports"),
      MOCK_PAGE,
    ),

  generate: (type: ReportSummary["type"], params?: Record<string, string>) =>
    apiClient.post<ReportSummary>("/reports/generate", {
      type,
      ...params,
    } as any),

  download: (id: string) =>
    withFallback(
      () => apiClient.get<{ url: string }>(`/reports/${id}/download`),
      { url: "#" },
    ),
};
