import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class TimesheetsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "timesheet", {
      createData: (dto, tenantId) => ({ tenantId, staffId: String(dto.metadata?.staffId || ""), hours: dto.metadata?.hours || 0, status: dto.status || "PENDING" }),
      updateData: (dto) => ({ status: dto.status }),
    });
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
