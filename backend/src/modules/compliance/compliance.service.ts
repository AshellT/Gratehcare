import { Injectable, NotFoundException } from "@nestjs/common";
import { RecordStatus, Severity } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { CreateCredentialDto } from "./dto/create-credential.dto";

const CATEGORY_ALIASES: Record<string, string> = {
  risk: "risk",
  "risk-alerts": "risk",
  credential: "credential",
  credentials: "credential",
  investigation: "investigation",
  investigations: "investigation",
  corrective_action: "corrective_action",
  "corrective action": "corrective_action",
  "corrective-actions": "corrective_action",
  compliance: "compliance",
  audit: "audit",
  policy: "policy",
  training: "training",
  expiry: "expiry",
};

export function normalizeCategory(raw?: string): string {
  const key = String(raw || "compliance").trim().toLowerCase();
  return CATEGORY_ALIASES[key] || key.replace(/\s+/g, "_");
}

@Injectable()
export class ComplianceService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "complianceEvent", {
      createData: (dto, tenantId) => {
        const note = dto.description || (dto.metadata?.summary as string) || "";
        const owner = (dto.metadata?.owner as string) || "";
        return {
          tenantId,
          title: dto.title,
          category: normalizeCategory(String(dto.metadata?.category || "compliance")),
          severity: (dto.severity as Severity) || (dto.metadata?.severity as Severity) || "MEDIUM",
          status: dto.status || "PENDING",
          dueAt: dto.metadata?.dueAt ? new Date(String(dto.metadata.dueAt)) : undefined,
          evidence: note || owner ? [{ note, owner }] : [],
        };
      },
      updateData: (dto) => ({
        title: dto.title,
        severity: dto.severity,
        status: dto.status,
        dueAt: dto.metadata?.dueAt ? new Date(String(dto.metadata.dueAt)) : undefined,
      }),
    });
  }

  serialize(event: Record<string, any>) {
    const evidence = Array.isArray(event.evidence) ? event.evidence : [];
    const note = evidence[0]?.note || evidence[0]?.owner || "";
    return {
      ...event,
      category: normalizeCategory(event.category),
      evidence,
      summary: note || event.title,
      assignee: evidence[0]?.owner || event.assignee || "Unassigned",
    };
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const category = query.category ? normalizeCategory(query.category) : undefined;
    const where = await this.scopedWhere(user, {
      ...(status ? { status: status.toUpperCase() as RecordStatus } : {}),
      ...(category ? { category } : {}),
    });
    const [items, total] = await Promise.all([
      this.prisma.complianceEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueAt: "asc" },
      }),
      this.prisma.complianceEvent.count({ where }),
    ]);
    return { items: items.map((item) => this.serialize(item)), total, page, limit };
  }

  override async create(dto: Parameters<TenantCrudService["create"]>[0], user: AuthUser) {
    const created = await super.create(dto, user);
    return this.serialize(created);
  }

  async complete(id: string, user: AuthUser) {
    await this.get(id, user);
    const updated = await this.prisma.complianceEvent.update({
      where: { id },
      data: { status: "COMPLETED" },
    });
    return this.serialize(updated);
  }

  async listCredentials(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    const [items, total] = await Promise.all([
      this.prisma.staffCredential.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { expiresAt: "asc" },
        include: { staff: { include: { user: { select: { fullName: true } } } } },
      }),
      this.prisma.staffCredential.count({ where }),
    ]);
    return {
      items: items.map((item) => this.serializeCredential(item)),
      total,
      page,
      limit,
    };
  }

  async createCredential(dto: CreateCredentialDto, user: AuthUser) {
    const tenantId = user.tenantId;
    if (!tenantId) throw new NotFoundException("Tenant required");
    const staff = await this.prisma.staff.findFirst({
      where: { id: dto.staffId, tenantId },
    });
    if (!staff) throw new NotFoundException("Staff member not found");
    const created = await this.prisma.staffCredential.create({
      data: {
        tenantId,
        staffId: dto.staffId,
        type: dto.type.trim(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: "ACTIVE",
      },
      include: { staff: { include: { user: { select: { fullName: true } } } } },
    });
    await this.audit(user, "create", created.id, { type: created.type, staffId: created.staffId });
    return this.serializeCredential(created);
  }

  private serializeCredential(item: {
    id: string;
    tenantId: string;
    staffId: string;
    type: string;
    expiresAt: Date | null;
    status: string;
    staff?: { title?: string | null; user?: { fullName?: string | null } | null };
  }) {
    const now = Date.now();
    const expires = item.expiresAt ? item.expiresAt.getTime() : null;
    const days = expires == null ? null : Math.ceil((expires - now) / (24 * 60 * 60 * 1000));
    const severity =
      days == null ? "medium" : days < 0 ? "critical" : days <= 14 ? "high" : days <= 30 ? "medium" : "low";
    return {
      id: item.id,
      tenantId: item.tenantId,
      staffId: item.staffId,
      type: item.type,
      title: item.type,
      category: "credential",
      expiresAt: item.expiresAt,
      status: item.status,
      severity: severity.toUpperCase(),
      staffName: item.staff?.user?.fullName || item.staff?.title || "Staff member",
    };
  }
}
