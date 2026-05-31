import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class ReportsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "report", {
      createData: (dto, tenantId) => ({ tenantId, title: dto.title, type: String(dto.metadata?.type || "operational"), payload: dto.metadata || {}, status: dto.status || "ACTIVE" }),
      updateData: (dto) => ({ title: dto.title, status: dto.status, payload: dto.metadata }),
      defaultOrderBy: { createdAt: "desc" },
    });
  }

  async generate(body: { title?: string; type?: string; metadata?: Record<string, unknown> }, user: AuthUser) {
    const tenantId = user.tenantId;
    if (!tenantId) throw new Error("Tenant required");
    return this.prisma.report.create({
      data: {
        tenantId,
        title: body.title || `Report ${new Date().toISOString().slice(0, 10)}`,
        type: body.type || "operational",
        payload: (body.metadata || {}) as object,
        status: "ACTIVE",
      },
    });
  }

  async download(id: string, user: AuthUser) {
    const report = await this.get(id, user);
    return {
      id: report.id,
      title: report.title,
      type: report.type,
      payload: report.payload,
      generatedAt: report.createdAt,
    };
  }
}
