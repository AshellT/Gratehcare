import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateIntegrationDto } from "./dto/create-integration.dto";
import { UpdateIntegrationConfigDto } from "./dto/update-integration-config.dto";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const [items, total] = await Promise.all([
      this.prisma.integration.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.integration.count(),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const item = await this.prisma.integration.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Integration not found");
    return item;
  }

  async create(dto: CreateIntegrationDto, user: AuthUser) {
    const item = await this.prisma.integration.create({
      data: {
        name: dto.name,
        type: dto.type,
        enabled: dto.enabled ?? false,
        config: dto.config || {},
        status: dto.enabled ? "active" : "disabled",
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "create",
        resource: "integration",
        resourceId: item.id,
      },
    });
    return item;
  }

  async enable(id: string, user: AuthUser) {
    const item = await this.get(id);
    const updated = await this.prisma.integration.update({
      where: { id },
      data: { enabled: true, status: "active" },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "update",
        resource: "integration",
        resourceId: item.id,
        metadata: { action: "enable" },
      },
    });
    return updated;
  }

  async disable(id: string, user: AuthUser) {
    const item = await this.get(id);
    const updated = await this.prisma.integration.update({
      where: { id },
      data: { enabled: false, status: "disabled" },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "update",
        resource: "integration",
        resourceId: item.id,
        metadata: { action: "disable" },
      },
    });
    return updated;
  }

  async updateConfig(
    id: string,
    dto: UpdateIntegrationConfigDto,
    user: AuthUser,
  ) {
    const item = await this.get(id);
    const updated = await this.prisma.integration.update({
      where: { id },
      data: { config: dto.config },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "update",
        resource: "integration",
        resourceId: item.id,
        metadata: { action: "update_config" },
      },
    });
    return updated;
  }

  async delete(id: string, user: AuthUser) {
    const item = await this.get(id);
    await this.prisma.integration.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "delete",
        resource: "integration",
        resourceId: item.id,
      },
    });
    return { success: true };
  }

  async getLogs(id: string, query: PaginationDto) {
    await this.get(id);
    const page = query.page || 1;
    const limit = query.limit || 25;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { resource: "integration", resourceId: id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.auditLog.count({
        where: { resource: "integration", resourceId: id },
      }),
    ]);
    return { items, total, page, limit };
  }
}
