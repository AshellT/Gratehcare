import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class TicketsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "supportTicket", {
      createData: (dto, tenantId) => ({
        tenantId,
        number: (dto.metadata?.number as string) || `TKT-${Date.now()}`,
        subject: dto.title,
        description: dto.description,
        priority: (dto.metadata?.priority as string) || "MEDIUM",
        status: "OPEN",
        requesterId: dto.metadata?.requesterId as string | undefined,
      }),
      updateData: (dto) => ({
        subject: dto.title,
        description: dto.description,
        priority: dto.metadata?.priority as string | undefined,
        status: dto.metadata?.ticketStatus as string | undefined,
      }),
      archiveData: { status: "CLOSED" },
      defaultOrderBy: { createdAt: "desc" },
    });
  }
}
