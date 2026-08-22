import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class MedicationService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "medication", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || ""),
        name: dto.title,
        dosage: (dto.metadata?.dosage as string) || undefined,
        schedule: dto.description,
        status: dto.status || "ACTIVE",
      }),
      updateData: (dto) => ({ name: dto.title, schedule: dto.description, status: dto.status }),
    });
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, {
      ...(status ? { status: status.toUpperCase() as any } : {}),
    });
    const [items, total] = await Promise.all([
      this.prisma.medication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.medication.count({ where }),
    ]);
    return { items, total, page, limit };
  }
}
