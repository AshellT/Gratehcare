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

export const documentsApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Document> | { items?: Document[] }>("/documents", {
            params: query as any,
          })
          .then(normalizePage),
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
    return apiClient.post<Document>("/documents/upload", form);
  },

  getPreviewUrl: (id: string) =>
    withFallback(
      () => apiClient.get<{ url: string }>(`/documents/${id}/preview`),
      { url: "" },
    ),

  archive: (id: string) => apiClient.post(`/documents/${id}/archive`, {}),
};
