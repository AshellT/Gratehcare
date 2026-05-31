import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const [tenants, users, integrations, openTickets, recentErrors] = await Promise.all([
      this.prisma.tenant.count({ where: { status: "ACTIVE" } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.integration.findMany(),
      this.prisma.supportTicket.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const enabled = integrations.filter((i) => i.enabled).length;

    return {
      tenants,
      users,
      integrations: { enabled, total: integrations.length },
      openTickets,
      recentErrors,
      status: openTickets > 50 || recentErrors > 10 ? "degraded" : "healthy",
    };
  }
}
