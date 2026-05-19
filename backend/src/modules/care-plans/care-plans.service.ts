import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class CarePlansService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "carePlan", {
      createData: (dto, tenantId) => ({ tenantId, clientId: String(dto.metadata?.clientId || ""), title: dto.title, status: dto.status || "DRAFT", goals: [], risks: [] }),
      updateData: (dto) => ({ title: dto.title, status: dto.status }),
    });
  }
}
