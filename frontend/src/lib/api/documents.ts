import { apiClient, withFallback } from "./client";
import type { Document, PaginatedResponse, PaginationQuery } from "./types";

const MOCK_DOCS: Document[] = [
  {
    id: "doc-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    name: "Eleanor_R_Care_Plan_2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1_240_000,
    status: "ready",
    uploadedBy: "Priya Raman",
  },
  {
    id: "doc-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    name: "Incident_Report_INC-481.pdf",
    mimeType: "application/pdf",
    sizeBytes: 523_000,
    status: "ready",
    uploadedBy: "James O.",
  },
  {
    id: "doc-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    name: "NDIS_Agreement_Marcus_T.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 89_000,
    status: "ready",
    uploadedBy: "Operations Admin",
  },
];

const MOCK_PAGE: PaginatedResponse<Document> = {
  data: MOCK_DOCS,
  total: MOCK_DOCS.length,
  page: 1,
  limit: 20,
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 20 * 1024 * 1024;

export const documentsApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Document>>("/documents", {
          params: query as any,
        }),
      MOCK_PAGE,
    ),

  upload: async (file: File): Promise<Document & { _isMock?: boolean }> => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`File exceeds 20 MB limit`);
    }
    const form = new FormData();
    form.append("file", file);
    return withFallback(
      () => apiClient.post<Document>("/documents/upload", form),
      {
        id: `mock-${crypto.randomUUID().slice(0, 8)}`,
        tenantId: "demo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        status: "ready" as const,
        uploadedBy: "You",
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      },
    );
  },

  getPreviewUrl: (id: string) =>
    withFallback(
      () => apiClient.get<{ url: string }>(`/documents/${id}/preview`),
      { url: "" },
    ),

  delete: (id: string) => apiClient.delete(`/documents/${id}`),
};
