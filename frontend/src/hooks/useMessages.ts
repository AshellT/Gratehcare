import { messagesApi } from "@/lib/api/messages";
import type {
  Conversation,
  Message,
  PaginatedResponse,
  PaginationQuery,
} from "@/lib/api/types";
import { useCallback } from "react";
import { useApi } from "./useApi";

export function useConversations(query?: PaginationQuery) {
  const state = useApi<PaginatedResponse<Conversation>>(
    () => messagesApi.listConversations(query),
    [JSON.stringify(query)],
  );

  const create = useCallback(
    async (subject: string, content: string) => {
      const created = await messagesApi.createConversation({ subject, content });
      state.refetch();
      return created;
    },
    [state],
  );

  return { ...state, create };
}

export function useMessages(conversationId: string | null) {
  const state = useApi<PaginatedResponse<Message>>(
    () => messagesApi.getMessages(conversationId ?? "", {}),
    [conversationId],
  );

  const send = useCallback(
    async (content: string) => {
      if (!conversationId) return;
      await messagesApi.sendMessage(conversationId, content);
      state.refetch();
    },
    [conversationId, state],
  );

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    await messagesApi.markRead(conversationId);
  }, [conversationId]);

  return { ...state, send, markRead };
}
