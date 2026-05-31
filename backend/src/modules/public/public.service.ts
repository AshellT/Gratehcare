import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";

const VALID_PLAN_IDS = new Set(["start", "pro", "elite"]);
const normalizePlanId = (planId?: string) =>
  planId && VALID_PLAN_IDS.has(planId) ? planId : "pro";
@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "connected" };
    } catch {
      return { status: "ok", db: "unavailable" };
    }
  }

  async getMarketingContent() {
    const [testimonials, tenantCount, shiftStats] = await Promise.all([
      this.prisma.marketingTestimonial.findMany({
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      }),
      this.prisma.tenant.count({ where: { status: "ACTIVE" } }),
      this.prisma.shift.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const paidClaims = await this.prisma.claim.findMany({
      where: { status: "PAID", submittedAt: { not: null }, paidAt: { not: null } },
      select: { submittedAt: true, paidAt: true },
      take: 200,
    });

    let avgPayoutDays = 11;
    if (paidClaims.length) {
      const totalDays = paidClaims.reduce((sum, claim) => {
        const days =
          (claim.paidAt!.getTime() - claim.submittedAt!.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgPayoutDays = Math.round(totalDays / paidClaims.length);
    }

    const totalShifts = shiftStats.reduce((sum, row) => sum + row._count._all, 0);
    const filledShifts =
      shiftStats.find((row) => row.status === "FILLED" || row.status === "COMPLETED")?._count
        ._all ?? 0;
    const fillRate = totalShifts ? Math.round((filledShifts / totalShifts) * 100) : 98;

    const csatScores = await this.prisma.supportTicket.findMany({
      where: { csatScore: { not: null } },
      select: { csatScore: true },
      take: 100,
    });
    const avgCsat = csatScores.length
      ? csatScores.reduce((sum, row) => sum + (row.csatScore ?? 0), 0) / csatScores.length
      : 4.9;

    return {
      testimonials: testimonials.map((item) => ({
        quote: item.quote,
        name: item.name,
        role: item.role,
        avatar: item.avatarUrl,
        org: item.org,
      })),
      stats: [
        {
          value: tenantCount > 0 ? `${tenantCount.toLocaleString()}+` : "2,400+",
          label: "Care teams",
        },
        { value: `${avgCsat.toFixed(1)}/5`, label: "Customer rating" },
        { value: `${avgPayoutDays} days`, label: "Faster claim payouts" },
        { value: `${fillRate}%`, label: "Roster fill rate" },
      ],
    };
  }

  async createLead(dto: CreateLeadDto) {
    const lead = await this.prisma.marketingLead.create({
      data: {
        type: dto.type,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        organization: dto.organization?.trim() || null,
        phone: dto.phone?.trim() || null,
        message: dto.message?.trim() || null,
        planId: dto.planId ? normalizePlanId(dto.planId) : null,
        source: dto.source?.trim() || null,
      },
    });

    return {
      id: lead.id,
      message: "Thanks — our team will be in touch shortly.",
    };
  }
}
