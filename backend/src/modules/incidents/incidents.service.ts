import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class IncidentsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "incident", {
      createData: (dto, tenantId) => ({ tenantId, clientId: dto.metadata?.clientId as string | undefined, title: dto.title, details: dto.description, severity: dto.severity || "MEDIUM", status: dto.status || "PENDING" }),
      updateData: (dto) => ({ title: dto.title, details: dto.description, severity: dto.severity, status: dto.status }),
    });
  }
}
