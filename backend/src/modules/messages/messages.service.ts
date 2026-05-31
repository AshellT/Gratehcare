import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(query: PaginationDto, user: AuthUser) {
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { sender: { select: { fullName: true, email: true } } },
    });

    const threads = new Map<string, typeof messages>();
    for (const msg of messages) {
      const list = threads.get(msg.threadId) || [];
      list.push(msg);
      threads.set(msg.threadId, list);
    }

    const items = Array.from(threads.entries()).map(([threadId, msgs]) => {
      const latest = msgs[0];
      const names = msgs
        .map((m) => m.sender?.fullName)
        .filter(Boolean) as string[];
      return {
        id: threadId,
        participantNames: [...new Set(names)],
        lastMessage: latest.body,
        lastMessageAt: latest.createdAt.toISOString(),
        unreadCount: msgs.filter((m) => m.status !== "READ").length,
      };
    });

    const page = query.page || 1;
    const limit = query.limit || 25;
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      total: items.length,
      page,
      limit,
    };
  }

  async getThreadMessages(threadId: string, query: PaginationDto, user: AuthUser) {
    const where = {
      threadId,
      ...(user.tenantId ? { tenantId: user.tenantId } : {}),
    };
    const page = query.page || 1;
    const limit = query.limit || 50;
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { fullName: true } } },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      items: items.map((m) => ({
        id: m.id,
        conversationId: m.threadId,
        senderName: m.sender?.fullName || "Unknown",
        content: m.body,
        sentAt: m.createdAt.toISOString(),
        isOwn: m.senderId === user.sub,
      })),
      total,
      page,
      limit,
    };
  }

  async sendMessage(threadId: string, content: string, user: AuthUser) {
    const tenantId = user.tenantId;
    if (!tenantId) throw new NotFoundException("Tenant required");

    const msg = await this.prisma.message.create({
      data: {
        tenantId,
        threadId,
        senderId: user.sub,
        subject: null,
        body: content,
        status: "SENT",
      },
      include: { sender: { select: { fullName: true } } },
    });

    return {
      id: msg.id,
      conversationId: msg.threadId,
      senderName: msg.sender?.fullName || user.email,
      content: msg.body,
      sentAt: msg.createdAt.toISOString(),
      isOwn: true,
    };
  }

  async markThreadRead(threadId: string, user: AuthUser) {
    await this.prisma.message.updateMany({
      where: {
        threadId,
        ...(user.tenantId ? { tenantId: user.tenantId } : {}),
        NOT: { senderId: user.sub },
      },
      data: { status: "READ" },
    });
    return { ok: true };
  }

  async createThread(subject: string, content: string, user: AuthUser) {
    const tenantId = user.tenantId;
    if (!tenantId) throw new NotFoundException("Tenant required");
    const threadId = randomUUID();
    await this.prisma.message.create({
      data: {
        tenantId,
        threadId,
        senderId: user.sub,
        subject,
        body: content,
        status: "SENT",
      },
    });
    return { id: threadId, participantNames: [user.email], lastMessage: content, unreadCount: 0 };
  }
}
