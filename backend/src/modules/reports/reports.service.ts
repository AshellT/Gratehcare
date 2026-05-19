import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class ReportsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "report", {
      createData: (dto, tenantId) => ({ tenantId, title: dto.title, type: String(dto.metadata?.type || "operational"), payload: dto.metadata || {}, status: dto.status || "ACTIVE" }),
      updateData: (dto) => ({ title: dto.title, status: dto.status, payload: dto.metadata }),
      defaultOrderBy: { createdAt: "desc" },
    });
  }
}
