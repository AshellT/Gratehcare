import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class IncidentsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "incident", {
      createData: (dto, tenantId) => ({ tenantId, clientId: dto.metadata?.clientId as string | undefined, title: dto.title, details: dto.description, severity: dto.severity || "MEDIUM", status: dto.status || "PENDING" }),
      updateData: (dto) => ({ title: dto.title, details: dto.description, severity: dto.severity, status: dto.status }),
    });
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const status = query.status?.trim();
    const where = {
      ...(user.tenantId ? { tenantId: user.tenantId } : {}),
      ...(status ? { status: status.toUpperCase() as any } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.incident.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async close(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.incident.update({ where: { id }, data: { status: "COMPLETED" } });
  }
}
