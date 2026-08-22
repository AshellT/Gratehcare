import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";

@Injectable()
export class TimesheetsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "timesheet", {
      createData: (dto, tenantId) => ({
        tenantId,
        staffId: String(dto.metadata?.staffId || ""),
        hours: (dto.metadata?.hours as number) || 0,
        mileage:
          dto.metadata?.mileage != null ? (dto.metadata?.mileage as number) : undefined,
        status: dto.status || "PENDING",
      }),
      updateData: (dto) => ({ status: dto.status }),
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
      this.prisma.timesheet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "desc" },
        include: { staff: { select: { title: true, user: { select: { fullName: true } } } } },
      }),
      this.prisma.timesheet.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const scope = await this.recordScope(user);
    const staffId = (dto.metadata?.staffId as string) || scope.staffId || "";
    if (scope.mode === "filtered" && scope.staffId && staffId !== scope.staffId) {
      throw new BadRequestException("You can only submit your own timesheet");
    }
    return super.create({ ...dto, metadata: { ...dto.metadata, staffId } }, user);
  }

  async submit(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.timesheet.update({ where: { id }, data: { status: "REVIEW" } });
  }

  async approve(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.timesheet.update({ where: { id }, data: { status: "APPROVED" } });
  }

  async reject(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.timesheet.update({ where: { id }, data: { status: "CANCELLED" } });
  }
}
