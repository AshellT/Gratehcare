import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class RosteringService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "shift", {
      createData: (dto, tenantId) => {
        const meta = dto.metadata ?? {};
        const startsAt = meta.startsAt ? new Date(String(meta.startsAt)) : new Date();
        const endsAt = meta.endsAt
          ? new Date(String(meta.endsAt))
          : new Date(startsAt.getTime() + 60 * 60 * 1000);
        const staffId = (meta.staffId as string) || undefined;
        return {
          tenantId,
          clientId: (meta.clientId as string) || undefined,
          staffId,
          startsAt,
          endsAt,
          service: dto.title,
          notes: dto.description,
          status: staffId ? "FILLED" : "OPEN",
        };
      },
      updateData: (dto) => {
        const meta = dto.metadata ?? {};
        const staffId = meta.staffId as string | undefined;
        return {
          service: dto.title,
          notes: dto.description,
          ...(meta.startsAt ? { startsAt: new Date(String(meta.startsAt)) } : {}),
          ...(meta.endsAt ? { endsAt: new Date(String(meta.endsAt)) } : {}),
          ...(meta.clientId ? { clientId: String(meta.clientId) } : {}),
          ...(staffId !== undefined
            ? { staffId: staffId || null, status: staffId ? "FILLED" : "OPEN" }
            : {}),
        };
      },
      archiveData: { status: "CANCELLED" },
      defaultOrderBy: { startsAt: "desc" },
    });
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, {
      ...(status ? { status: status.toUpperCase() as any } : {}),
    });
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

  async assignWorker(id: string, staffId: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.shift.update({
      where: { id },
      data: { staffId: staffId || undefined, status: staffId ? "FILLED" : "OPEN" },
    });
  }
}
