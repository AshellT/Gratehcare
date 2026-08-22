import { Injectable, NotFoundException } from "@nestjs/common";
import { ClaimStatus } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { toMoney } from "@/common/utils/money";

@Injectable()
export class ClaimsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "claim", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || "").trim() || undefined,
        number: (dto.metadata?.number as string) || `CLM-${Date.now().toString().slice(-6)}`,
        payer: (dto.metadata?.payer as string) || "NDIS",
        service: (dto.metadata?.service as string) || dto.title,
        amount: toMoney(dto.metadata?.amount),
        status: (dto.metadata?.claimStatus as string) || "DRAFT",
        submittedAt: dto.metadata?.submittedAt
          ? new Date(String(dto.metadata.submittedAt))
          : (dto.metadata?.claimStatus as string) === "SUBMITTED"
            ? new Date()
            : undefined,
      }),
      updateData: (dto) => ({
        service: dto.title,
        status: (dto.metadata?.claimStatus as string) || undefined,
        payer: dto.metadata?.payer as string | undefined,
        amount: dto.metadata?.amount != null ? toMoney(dto.metadata.amount) : undefined,
        clientId: String(dto.metadata?.clientId || "").trim() || undefined,
      }),
      archiveData: { status: "REJECTED" },
      defaultOrderBy: { createdAt: "desc" },
    });
  }

  serialize(claim: Record<string, any>) {
    return {
      ...claim,
      amount: toMoney(claim.amount),
      clientName: claim.client?.fullName ?? claim.clientName ?? "—",
    };
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, {
      ...(status ? { status: status.toUpperCase() as ClaimStatus } : {}),
    });
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
    return { items: items.map((item) => this.serialize(item)), total, page, limit };
  }

  override async get(id: string, user: AuthUser) {
    const where = await this.scopedWhere(user, { id });
    const item = await this.prisma.claim.findFirst({
      where,
      include: { client: { select: { fullName: true } } },
    });
    if (!item) {
      throw new NotFoundException("claim not found");
    }
    return this.serialize(item);
  }

  override async create(dto: Parameters<TenantCrudService["create"]>[0], user: AuthUser) {
    const created = await super.create(dto, user);
    return this.get(created.id, user);
  }

  async setStatus(id: string, status: ClaimStatus, user: AuthUser) {
    await super.get(id, user);
    await this.prisma.claim.update({
      where: { id },
      data: {
        status,
        submittedAt: status === "SUBMITTED" ? new Date() : undefined,
        paidAt: status === "PAID" ? new Date() : undefined,
      },
    });
    return this.get(id, user);
  }
}
