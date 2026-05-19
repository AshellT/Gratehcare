import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class CareNotesService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "careNote", {
      createData: (dto, tenantId) => ({ tenantId, clientId: String(dto.metadata?.clientId || ""), title: dto.title, body: dto.description || "", status: dto.status || "ACTIVE" }),
      updateData: (dto) => ({ title: dto.title, body: dto.description, status: dto.status }),
      defaultOrderBy: { createdAt: "desc" },
    });
  }
}
