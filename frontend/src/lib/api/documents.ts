import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { Document, PaginatedResponse, PaginationQuery } from "./types";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_BYTES = 20 * 1024 * 1024;

type RawDocument = Partial<Document> & {
  title?: string;
  status?: string;
};

const normalizeDocumentStatus = (status?: string): Document["status"] => {
  switch (String(status ?? "ACTIVE").toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
    case "COMPLETED":
      return "ready";
    case "ARCHIVED":
    case "CANCELLED":
      return "error";
    default:
      return "uploading";
  }
};

const normalizeDocument = (doc: RawDocument): Document => ({
  ...(doc as Document),
  name: doc.name ?? doc.title ?? "Document",
  mimeType: doc.mimeType ?? "application/octet-stream",
  sizeBytes: Number(doc.sizeBytes) || 0,
  status: normalizeDocumentStatus(doc.status),
  uploadedBy: doc.uploadedBy ?? "Backend",
});

const normalizeDocumentPage = (
  page: PaginatedResponse<RawDocument> | { items?: RawDocument[] },
) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeDocument) };
};

export const documentsApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<RawDocument> | { items?: RawDocument[] }>("/documents", {
            params: query as any,
          })
          .then(normalizeDocumentPage),
      emptyPage<Document>(),
    ),

  upload: async (file: File): Promise<Document> => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error(`File exceeds 20 MB limit`);
    }
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<RawDocument>("/documents/upload", form).then(normalizeDocument);
  },

  getPreviewUrl: (id: string) =>
    withFallback(
      () => apiClient.get<{ url: string }>(`/documents/${id}/preview`),
      { url: "" },
    ),

  archive: (id: string) => apiClient.post(`/documents/${id}/archive`, {}),
};
