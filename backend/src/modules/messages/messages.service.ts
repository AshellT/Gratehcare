import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class MessagesService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "message", {
      createData: (dto, tenantId) => ({ tenantId, senderId: dto.metadata?.senderId as string | undefined, threadId: String(dto.metadata?.threadId || randomUUID()), subject: dto.title, body: dto.description || "", status: "SENT" }),
      updateData: (dto) => ({ subject: dto.title, body: dto.description }),
      archiveData: { status: "ARCHIVED" },
      defaultOrderBy: { createdAt: "desc" },
    });
  }
}
