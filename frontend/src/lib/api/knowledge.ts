import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type { PaginatedResponse, PaginationQuery } from "./types";

export type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  body: string;
  tags?: string[];
  published?: boolean;
  createdAt?: string;
};

export const knowledgeApi = {
  list: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<KnowledgeArticle> | { items?: KnowledgeArticle[] }>(
            "/knowledge",
            { params: query as any },
          )
          .then(normalizePage),
      emptyPage<KnowledgeArticle>(),
    ),

  create: (data: { title: string; category?: string; body: string; tags?: string[] }) =>
    apiClient.post<KnowledgeArticle>("/knowledge", data as any),

  update: (id: string, data: Partial<KnowledgeArticle>) =>
    apiClient.patch<KnowledgeArticle>(`/knowledge/${id}`, data as any),

  archive: (id: string) => apiClient.post(`/knowledge/${id}/archive`, {}),
};
