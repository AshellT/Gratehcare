import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class RosteringService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "shift", {
      createData: (dto, tenantId) => ({ tenantId, startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 60 * 1000), service: dto.title, notes: dto.description, status: "OPEN" }),
      updateData: (dto) => ({ service: dto.title, notes: dto.description }),
      archiveData: { status: "CANCELLED" },
      defaultOrderBy: { startsAt: "desc" },
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
      this.prisma.shift.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startsAt: "desc" },
        include: {
          client: { select: { fullName: true } },
          staff: { select: { title: true, user: { select: { fullName: true } } } },
        },
      }),
      this.prisma.shift.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
