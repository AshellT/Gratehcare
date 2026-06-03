import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";

@Injectable()
export class CarePlansService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "carePlan", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || ""),
        title: dto.title,
        status: dto.status || "DRAFT",
        goals: Array.isArray(dto.metadata?.goals)
          ? (dto.metadata?.goals as string[])
          : [],
        risks: [],
        reviewDue: dto.metadata?.reviewDue
          ? new Date(String(dto.metadata?.reviewDue))
          : undefined,
      }),
      updateData: (dto) => ({ title: dto.title, status: dto.status }),
    });
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    if (!tenantId) throw new BadRequestException("Tenant required");

    let clientId = dto.metadata?.clientId as string | undefined;
    if (!clientId && dto.metadata?.clientName) {
      const byName = await this.prisma.client.findFirst({
        where: {
          tenantId,
          fullName: { contains: String(dto.metadata.clientName), mode: "insensitive" },
        },
      });
      clientId = byName?.id;
    }
    if (!clientId) {
      const fallback = await this.prisma.client.findFirst({ where: { tenantId } });
      clientId = fallback?.id;
    }
    if (!clientId) throw new BadRequestException("Client required for care plan");

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
    const limit = query.limit || 25;
    const status = query.status?.trim();
    const where = {
      ...(user.tenantId ? { tenantId: user.tenantId } : {}),
      ...(status ? { status: status.toUpperCase() as any } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.carePlan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.carePlan.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
