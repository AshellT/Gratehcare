import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class ClientsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "client", {
      createData: (dto, tenantId) => ({ tenantId, fullName: dto.title, status: dto.status || "ACTIVE", riskLevel: dto.severity }),
      updateData: (dto) => ({ fullName: dto.title, status: dto.status, riskLevel: dto.severity }),
    });
  }
}
