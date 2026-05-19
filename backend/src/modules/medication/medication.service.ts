import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class MedicationService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "medication", {
      createData: (dto, tenantId) => ({ tenantId, clientId: String(dto.metadata?.clientId || ""), name: dto.title, schedule: dto.description, status: dto.status || "ACTIVE" }),
      updateData: (dto) => ({ name: dto.title, schedule: dto.description, status: dto.status }),
    });
  }
}
