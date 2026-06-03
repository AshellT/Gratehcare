import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class ComplianceService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "complianceEvent", {
      createData: (dto, tenantId) => ({
        tenantId,
        title: dto.title,
        category: String(dto.metadata?.category || "General"),
        severity: dto.severity || "MEDIUM",
        status: dto.status || "PENDING",
        dueAt: dto.metadata?.dueAt ? new Date(String(dto.metadata?.dueAt)) : undefined,
        evidence: dto.metadata?.summary ? [{ note: String(dto.metadata?.summary) }] : [],
      }),
      updateData: (dto) => ({ title: dto.title, severity: dto.severity, status: dto.status }),
    });
  }

  async complete(id: string, user: AuthUser) {
    await this.get(id, user);
    return this.prisma.complianceEvent.update({ where: { id }, data: { status: "COMPLETED" } });
  }
}
