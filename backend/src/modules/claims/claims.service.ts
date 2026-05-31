import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class ClaimsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "claim", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: dto.metadata?.clientId as string | undefined,
        number: (dto.metadata?.number as string) || `CLM-${Date.now()}`,
        payer: (dto.metadata?.payer as string) || "NDIS",
        service: (dto.metadata?.service as string) || dto.title,
        amount: (dto.metadata?.amount as number) || 0,
        status: (dto.metadata?.claimStatus as string) || "DRAFT",
        submittedAt: dto.metadata?.submittedAt
          ? new Date(String(dto.metadata.submittedAt))
          : undefined,
      }),
      updateData: (dto) => ({
        service: dto.title,
        status: dto.metadata?.claimStatus as string | undefined,
        payer: dto.metadata?.payer as string | undefined,
        amount: dto.metadata?.amount as number | undefined,
      }),
      archiveData: { status: "REJECTED" },
      defaultOrderBy: { createdAt: "desc" },
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
      this.prisma.claim.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.claim.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
