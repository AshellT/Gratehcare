import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class CareNotesService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "careNote", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || ""),
        staffId: (dto.metadata?.staffId as string) || undefined,
        title: dto.title,
        body: dto.description || "",
        sharedWithFamily: dto.metadata?.sharedWithFamily === true,
        status: dto.status || "ACTIVE",
      }),
      updateData: (dto) => ({ title: dto.title, body: dto.description, status: dto.status }),
      defaultOrderBy: { createdAt: "desc" },
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
    if (!clientId) throw new BadRequestException("Client required for care note");

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
      this.prisma.careNote.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { fullName: true } },
          staff: { select: { title: true, user: { select: { fullName: true } } } },
        },
      }),
      this.prisma.careNote.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
