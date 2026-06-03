import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class BillingService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "invoice", {
      createData: (dto, tenantId) => ({ tenantId, clientId: dto.metadata?.clientId as string | undefined, number: dto.title, amount: dto.metadata?.amount || 0, status: "DRAFT" }),
      updateData: (dto) => ({ number: dto.title }),
      archiveData: { status: "VOID" },
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
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async markPaid(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.invoice.update({ where: { id }, data: { status: "PAID" } });
  }

  async sendInvoice(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: "SENT", issuedAt: new Date() },
    });
  }
}
