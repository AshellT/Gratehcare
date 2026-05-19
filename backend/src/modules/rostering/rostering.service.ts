import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class RosteringService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "shift", {
      createData: (dto, tenantId) => ({ tenantId, startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 60 * 1000), service: dto.title, notes: dto.description, status: "OPEN" }),
      updateData: (dto) => ({ service: dto.title, notes: dto.description }),
      archiveData: { status: "CANCELLED" },
      defaultOrderBy: { startsAt: "desc" },
    });
  }
}
