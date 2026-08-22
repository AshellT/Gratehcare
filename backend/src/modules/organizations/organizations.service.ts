import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { SubscriptionsService } from "@/modules/subscriptions/subscriptions.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpgradeRequestDto } from "./dto/upgrade-request.dto";
import { PLANS } from "@/modules/subscription-billing/plan-catalog";

const PLAN_IDS = ["start", "pro", "elite"] as const;
type CatalogPlanId = (typeof PLAN_IDS)[number];

const normalizePlanId = (planId?: string | null): CatalogPlanId =>
  PLAN_IDS.includes(planId as CatalogPlanId) ? (planId as CatalogPlanId) : "pro";

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

  async platformRevenue() {
    const [tenants, userCount] = await Promise.all([
      this.prisma.tenant.findMany({
        select: {
          id: true,
          name: true,
          planId: true,
          subscriptionStatus: true,
          stripeSubscriptionId: true,
          currentPeriodEnd: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    const byPlan = Object.fromEntries(
      PLAN_IDS.map((id) => [id, { id, name: PLANS[id].name, monthlyPrice: PLANS[id].monthlyPrice, tenants: 0, paying: 0, trial: 0, mrr: 0 }]),
    ) as Record<
      CatalogPlanId,
      { id: CatalogPlanId; name: string; monthlyPrice: number; tenants: number; paying: number; trial: number; mrr: number }
    >;

    let payingTenants = 0;
    let trialTenants = 0;
    let pastDueTenants = 0;
    let cancelledTenants = 0;
    let mrr = 0;
    let trialPipelineMrr = 0;

    for (const tenant of tenants) {
      const planId = normalizePlanId(tenant.planId);
      const price = PLANS[planId].monthlyPrice;
      byPlan[planId].tenants += 1;
      const status = tenant.subscriptionStatus || "trial";
      const paying = status === "active" && Boolean(tenant.stripeSubscriptionId);

      if (paying) {
        payingTenants += 1;
        mrr += price;
        byPlan[planId].paying += 1;
        byPlan[planId].mrr += price;
      } else if (status === "trial") {
        trialTenants += 1;
        trialPipelineMrr += price;
        byPlan[planId].trial += 1;
      } else if (status === "past_due") {
        pastDueTenants += 1;
      } else if (status === "cancelled") {
        cancelledTenants += 1;
      }
    }

    return {
      tenantCount: tenants.length,
      userCount,
      payingTenants,
      trialTenants,
      pastDueTenants,
      cancelledTenants,
      mrr,
      arr: mrr * 12,
      trialPipelineMrr,
      netRetentionPct: payingTenants + cancelledTenants > 0
        ? Math.round((payingTenants / (payingTenants + cancelledTenants)) * 100)
        : payingTenants > 0
          ? 100
          : 0,
      byPlan: PLAN_IDS.map((id) => byPlan[id]),
      recentTenants: tenants.slice(0, 8).map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        planId: normalizePlanId(tenant.planId),
        status: tenant.subscriptionStatus || "trial",
        paying: tenant.subscriptionStatus === "active" && Boolean(tenant.stripeSubscriptionId),
        monthlyPrice: PLANS[normalizePlanId(tenant.planId)].monthlyPrice,
      })),
    };
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
