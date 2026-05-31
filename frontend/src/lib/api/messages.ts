import { apiClient, emptyPage, normalizePage, withFallback } from "./client";
import type {
  Conversation,
  Message,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

export const messagesApi = {
  listConversations: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Conversation> | { items?: Conversation[] }>(
            "/messages",
            { params: query as any },
          )
          .then(normalizePage),
      emptyPage<Conversation>(),
    ),

  getMessages: (conversationId: string, query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient
          .get<PaginatedResponse<Message> | { items?: Message[] }>(
            `/messages/${conversationId}/messages`,
            { params: query as any },
          )
          .then(normalizePage),
      emptyPage<Message>(),
    ),

  sendMessage: (conversationId: string, content: string) =>
    apiClient.post<Message>(`/messages/${conversationId}/messages`, {
      content,
    } as any),

  createConversation: (participantIds: string[]) =>
    apiClient.post<Conversation>("/messages", { participantIds } as any),

  markRead: (conversationId: string) =>
    apiClient.patch(`/messages/${conversationId}/read`, {}),
};
