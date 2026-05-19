import { apiClient, withFallback } from "./client";
import type {
  Conversation,
  Message,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    participantNames: ["Priya Raman"],
    lastMessage: "I'll cover Eleanor's evening shift, no worries.",
    lastMessageAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    unreadCount: 2,
  },
  {
    id: "conv-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    participantNames: ["Daniel Wu"],
    lastMessage: "Care notes uploaded for today.",
    lastMessageAt: new Date(Date.now() - 3600_000).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    participantNames: ["Family · Eleanor R."],
    lastMessage: "Thank you for the update yesterday.",
    lastMessageAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    participantNames: ["Dr. Raj Patel"],
    lastMessage: "Physio review scheduled for Friday.",
    lastMessageAt: new Date(Date.now() - 86_400_000).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-005",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    participantNames: ["Operations team"],
    lastMessage: "Weekly roster published.",
    lastMessageAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "conv-001": [
    {
      id: "m-001",
      tenantId: "demo",
      createdAt: "",
      updatedAt: "",
      conversationId: "conv-001",
      senderName: "Priya Raman",
      content:
        "Hi! Quick question — am I covering Eleanor's evening shift today?",
      sentAt: "2026-04-28T10:14:00Z",
      isOwn: false,
    },
    {
      id: "m-002",
      tenantId: "demo",
      createdAt: "",
      updatedAt: "",
      conversationId: "conv-001",
      senderName: "Me",
      content: "Hi Priya — yes please, 19:00 onwards. Thanks for stepping in!",
      sentAt: "2026-04-28T10:16:00Z",
      isOwn: true,
    },
    {
      id: "m-003",
      tenantId: "demo",
      createdAt: "",
      updatedAt: "",
      conversationId: "conv-001",
      senderName: "Priya Raman",
      content: "All good. Will swing by the office to grab the keys.",
      sentAt: "2026-04-28T10:18:00Z",
      isOwn: false,
    },
    {
      id: "m-004",
      tenantId: "demo",
      createdAt: "",
      updatedAt: "",
      conversationId: "conv-001",
      senderName: "Priya Raman",
      content: "I'll cover Eleanor's evening shift, no worries.",
      sentAt: "2026-04-28T10:18:30Z",
      isOwn: false,
    },
    {
      id: "m-005",
      tenantId: "demo",
      createdAt: "",
      updatedAt: "",
      conversationId: "conv-001",
      senderName: "Me",
      content: "Perfect. Have a great day 💛",
      sentAt: "2026-04-28T10:21:00Z",
      isOwn: true,
    },
  ],
};

const MOCK_CONV_PAGE: PaginatedResponse<Conversation> = {
  data: MOCK_CONVERSATIONS,
  total: MOCK_CONVERSATIONS.length,
  page: 1,
  limit: 20,
};

export const messagesApi = {
  listConversations: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Conversation>>("/messages", {
          params: query as any,
        }),
      MOCK_CONV_PAGE,
    ),

  getMessages: (conversationId: string, query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<Message>>(
          `/messages/${conversationId}/messages`,
          { params: query as any },
        ),
      {
        data: MOCK_MESSAGES[conversationId] ?? [],
        total: (MOCK_MESSAGES[conversationId] ?? []).length,
        page: 1,
        limit: 50,
      },
    ),

  sendMessage: (conversationId: string, content: string) =>
    withFallback(
      () =>
        apiClient.post<Message>(`/messages/${conversationId}/messages`, {
          content,
        } as any),
      {
        id: `m-${crypto.randomUUID().slice(0, 8)}`,
        tenantId: "demo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        conversationId,
        senderName: "Me",
        content,
        sentAt: new Date().toISOString(),
        isOwn: true,
      },
    ),

  createConversation: (participantIds: string[]) =>
    apiClient.post<Conversation>("/messages", { participantIds } as any),

  markRead: (conversationId: string) =>
    apiClient.patch(`/messages/${conversationId}/read`, {}),
};
