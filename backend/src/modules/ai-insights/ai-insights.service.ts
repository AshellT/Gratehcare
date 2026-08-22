import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { BillingStatus, RecordStatus, Role, ShiftStatus } from "@prisma/client";
import { AuthUser } from "@/common/types/auth-user.type";

export type InsightCategory =
  | "staff_assignment"
  | "client_risk"
  | "burnout"
  | "billing_anomaly"
  | "compliance_risk"
  | "care_gap";

export type InsightSeverity = "critical" | "warning" | "info" | "success";

export interface AiInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  confidence: number;
  actionLabel?: string;
  meta?: Record<string, unknown>;
  generatedAt: string;
  isMock: boolean;
}

export interface AiInsightsSummary {
  insights: AiInsight[];
  generatedAt: string;
  tenantId: string;
}

@Injectable()
export class AiInsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(user: AuthUser, categories?: InsightCategory[]): Promise<AiInsightsSummary> {
    const tenantId = user.tenantId ?? "platform";
    const raw = await this.fetchFromProvider(user);
    const filtered = categories?.length
      ? raw.filter((insight) => categories.includes(insight.category))
      : raw;
    return {
      insights: filtered,
      generatedAt: new Date().toISOString(),
      tenantId,
    };
  }

  async getByCategory(user: AuthUser, category: InsightCategory): Promise<AiInsight[]> {
    const all = await this.fetchFromProvider(user);
    return all.filter((insight) => insight.category === category);
  }

  async getCritical(user: AuthUser): Promise<AiInsight[]> {
    const all = await this.fetchFromProvider(user);
    return all.filter((insight) => insight.severity === "critical" || insight.severity === "warning");
  }

  private async fetchFromProvider(user: AuthUser): Promise<AiInsight[]> {
    const tenantId = user.tenantId ?? "";
    if (!tenantId) return [];
    if (user.roles.some((role) => role === Role.FAMILY_USER || role === Role.PRACTITIONER)) {
      return [];
    }
    const now = new Date();
    const generatedAt = now.toISOString();

    const [openShifts, highRiskClients, overdueInvoices, openIncidents, duePlans, hours] =
      await Promise.all([
        this.prisma.shift.count({ where: { tenantId, status: ShiftStatus.OPEN } }),
        this.prisma.client.findMany({
          where: { tenantId, riskLevel: { in: ["HIGH", "CRITICAL"] } },
          take: 5,
          select: { id: true, fullName: true, riskLevel: true },
        }),
        this.prisma.invoice.findMany({
          where: {
            tenantId,
            OR: [
              { status: BillingStatus.OVERDUE },
              { status: BillingStatus.SENT, dueAt: { lt: now } },
            ],
          },
          take: 5,
          include: { client: { select: { fullName: true } } },
        }),
        this.prisma.incident.findMany({
          where: { tenantId, status: { in: [RecordStatus.PENDING, RecordStatus.ACTIVE, RecordStatus.REVIEW] } },
          take: 5,
          select: { id: true, title: true, severity: true },
        }),
        this.prisma.carePlan.findMany({
          where: { tenantId, reviewDue: { lt: now }, status: { not: RecordStatus.ARCHIVED } },
          take: 5,
          include: { client: { select: { fullName: true } } },
        }),
        this.prisma.timesheet.groupBy({
          by: ["staffId"],
          where: { tenantId },
          _sum: { hours: true },
        }),
      ]);

    const insights: AiInsight[] = [];

    if (openShifts > 0) {
      insights.push({
        id: "open-shifts",
        category: "staff_assignment",
        severity: openShifts >= 3 ? "warning" : "info",
        title: `${openShifts} open shift${openShifts === 1 ? "" : "s"} still unfilled`,
        description: "Publish or assign these shifts so visits are not missed.",
        confidence: 100,
        actionLabel: "Open rostering",
        meta: { openShifts },
        generatedAt,
        isMock: false,
      });
    }

    for (const client of highRiskClients) {
      insights.push({
        id: `risk-${client.id}`,
        category: "client_risk",
        severity: client.riskLevel === "CRITICAL" ? "critical" : "warning",
        title: `${client.fullName} is marked ${client.riskLevel?.toLowerCase()} risk`,
        description: "Review the care plan and recent notes for this client.",
        confidence: 90,
        actionLabel: "Open client",
        meta: { clientId: client.id },
        generatedAt,
        isMock: false,
      });
    }

    const heavy = hours.filter((row) => Number(row._sum.hours || 0) >= 40);
    if (heavy.length) {
      insights.push({
        id: "hours-load",
        category: "burnout",
        severity: "warning",
        title: `${heavy.length} staff member${heavy.length === 1 ? "" : "s"} over 40 hours this week`,
        description: "Consider redistributing shifts to reduce fatigue risk.",
        confidence: 85,
        actionLabel: "Review timesheets",
        meta: { staffIds: heavy.map((row) => row.staffId) },
        generatedAt,
        isMock: false,
      });
    }

    for (const invoice of overdueInvoices) {
      insights.push({
        id: `invoice-${invoice.id}`,
        category: "billing_anomaly",
        severity: "warning",
        title: `Invoice ${invoice.number} is overdue`,
        description: `${invoice.client?.fullName ?? "A client"} still has an unpaid invoice of ${invoice.amount}.`,
        confidence: 100,
        actionLabel: "Open billing",
        meta: { invoiceId: invoice.id },
        generatedAt,
        isMock: false,
      });
    }

    for (const incident of openIncidents) {
      insights.push({
        id: `incident-${incident.id}`,
        category: "compliance_risk",
        severity: incident.severity === "CRITICAL" || incident.severity === "HIGH" ? "critical" : "warning",
        title: `Open incident: ${incident.title}`,
        description: "This incident is still in progress and needs follow-up.",
        confidence: 100,
        actionLabel: "Open incidents",
        meta: { incidentId: incident.id },
        generatedAt,
        isMock: false,
      });
    }

    for (const plan of duePlans) {
      insights.push({
        id: `plan-${plan.id}`,
        category: "care_gap",
        severity: "warning",
        title: `${plan.client?.fullName ?? "Client"} care plan review is overdue`,
        description: plan.title,
        confidence: 100,
        actionLabel: "Review care plan",
        meta: { carePlanId: plan.id },
        generatedAt,
        isMock: false,
      });
    }

    if (!insights.length) {
      insights.push({
        id: "all-clear",
        category: "staff_assignment",
        severity: "success",
        title: "No operational risks detected",
        description: "Open shifts, overdue invoices, incidents and care-plan reviews look healthy.",
        confidence: 80,
        generatedAt,
        isMock: false,
      });
    }

    return insights;
  }
}
