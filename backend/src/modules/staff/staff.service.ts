import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class StaffService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "staff", {
      createData: (dto, tenantId) => ({
        tenantId,
        title: dto.title,
        status: dto.status || "ACTIVE",
        skills: Array.isArray(dto.metadata?.skills)
          ? (dto.metadata?.skills as string[])
          : [],
      }),
      updateData: (dto) => ({ title: dto.title, status: dto.status }),
    });
  }
}
