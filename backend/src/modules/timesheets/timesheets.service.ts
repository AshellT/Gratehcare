import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class TimesheetsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "timesheet", {
      createData: (dto, tenantId) => ({ tenantId, staffId: String(dto.metadata?.staffId || ""), hours: dto.metadata?.hours || 0, status: dto.status || "PENDING" }),
      updateData: (dto) => ({ status: dto.status }),
    });
  }
}
