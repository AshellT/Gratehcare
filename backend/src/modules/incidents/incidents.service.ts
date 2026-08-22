import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";

@Injectable()
export class IncidentsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "incident", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || "").trim() || undefined,
        title: dto.title,
        details: dto.description,
        severity: dto.severity || "MEDIUM",
        status: dto.status || "PENDING",
        occurredAt: dto.metadata?.occurredAt
          ? new Date(String(dto.metadata.occurredAt))
          : undefined,
      }),
      updateData: (dto) => ({ title: dto.title, details: dto.description, severity: dto.severity, status: dto.status }),
    });
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    const scope = await this.recordScope(user);
    let clientId = dto.metadata?.clientId as string | undefined;
    if (clientId && scope.mode === "filtered" && !scope.clientIds.includes(clientId)) {
      clientId = undefined;
    }
    if (!clientId && tenantId && dto.metadata?.clientName) {
      const byName = await this.prisma.client.findFirst({
        where: await this.scopedWhere(
          user,
          { fullName: { contains: String(dto.metadata.clientName), mode: "insensitive" } },
          "client",
        ),
      });
      clientId = byName?.id;
    }
    return super.create(
      {
        ...dto,
        metadata: { ...dto.metadata, clientId },
      },
      user,
    );
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, {
      ...(status ? { status: status.toUpperCase() as any } : {}),
    });
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
