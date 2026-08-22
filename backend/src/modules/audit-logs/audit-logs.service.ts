import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
          tenant: { select: { id: true, name: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      items: items.map((log) => ({
        id: log.id,
        action: `${log.action} ${log.resource}${log.resourceId ? ` ${log.resourceId.slice(0, 8)}` : ""}`.trim(),
        userId: log.actorId,
        tenantId: log.tenantId,
        user: log.actor ? { id: log.actor.id, name: log.actor.fullName } : undefined,
        tenant: log.tenant ? { id: log.tenant.id, name: log.tenant.name } : undefined,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
