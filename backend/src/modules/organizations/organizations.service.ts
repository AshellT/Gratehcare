import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { SubscriptionsService } from "@/modules/subscriptions/subscriptions.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpgradeRequestDto } from "./dto/upgrade-request.dto";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  async list(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.tenant.count(),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const item = await this.prisma.tenant.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Organization not found");
    return item;
  }

  async getCurrent(user: AuthUser) {
    if (!user.tenantId) {
      throw new NotFoundException("No organization linked to this account");
    }
    const tenant = await this.get(user.tenantId);
    return {
      ...tenant,
      subscription: this.subscriptions.resolveSubscription(tenant),
    };
  }

  async requestUpgrade(user: AuthUser, dto: UpgradeRequestDto) {
    if (!user.tenantId) {
      throw new NotFoundException("No organization linked to this account");
    }

    const tenant = await this.get(user.tenantId);
    const actor = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { email: true, fullName: true },
    });

    const lead = await this.prisma.marketingLead.create({
      data: {
        type: "enterprise",
        name: actor?.fullName || actor?.email || "Organization owner",
        email: actor?.email || user.email,
        organization: tenant.name,
        message:
          dto.message?.trim() ||
          `Upgrade request for ${tenant.name} on plan ${tenant.planId}.`,
        planId: tenant.planId,
        source: "subscription-upgrade",
      },
    });

    return {
      id: lead.id,
      message: "Upgrade request received. Our team will contact you shortly.",
    };
  }

  async create(dto: CreateTenantDto, user: AuthUser) {
    try {
      const item = await this.prisma.tenant.create({ data: dto });
      await this.prisma.auditLog.create({ data: { actorId: user.sub, action: "create", resource: "tenant", resourceId: item.id } });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Organization slug already exists");
      }
      throw error;
    }
  }
}
