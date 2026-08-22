import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateTenantRecordDto, UpdateTenantRecordDto } from "../dto/tenant-record.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { AuthUser } from "../types/auth-user.type";

export type TenantCrudConfig = {
  createData: (dto: CreateTenantRecordDto, tenantId: string) => Record<string, unknown>;
  updateData?: (dto: UpdateTenantRecordDto) => Record<string, unknown>;
  archiveData?: Record<string, unknown>;
  defaultOrderBy?: Record<string, "asc" | "desc">;
};

export type RecordScope = {
  mode: "unrestricted" | "filtered";
  clientIds: string[];
  staffId: string | null;
  sharedOnly: boolean;
  ownThreads: boolean;
};

const UNRESTRICTED_ROLES: Role[] = [
  Role.PLATFORM_OWNER,
  Role.SUPER_ADMIN,
  Role.PLATFORM_SUPPORT,
  Role.ORGANIZATION_OWNER,
  Role.OPERATIONS_ADMIN,
  Role.BILLING_OFFICER,
  Role.COMPLIANCE_OFFICER,
];

const NONE_ID = "00000000-0000-0000-0000-000000000000";

const inIds = (ids: string[]) => ({ in: ids.length ? ids : [NONE_ID] });

@Injectable()
export class TenantCrudService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly model: string,
    private readonly config: TenantCrudConfig,
  ) {}

  protected delegate() {
    return (this.prisma as unknown as Record<string, any>)[this.model];
  }

  async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, status ? { status: status.toUpperCase() } : {});
    const [items, total] = await Promise.all([
      this.delegate().findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: this.config.defaultOrderBy || { id: "desc" },
      }),
      this.delegate().count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string, user: AuthUser) {
    const where = await this.scopedWhere(user, { id });
    const item = await this.delegate().findFirst({ where });
    if (!item) throw new NotFoundException(`${this.model} not found`);
    return item;
  }

  async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    if (!tenantId) throw new BadRequestException("Tenant required");
    const item = await this.delegate().create({
      data: this.toCreateData(dto, tenantId),
    });
    await this.audit(user, "create", item.id, { dto });
    return item;
  }

  async update(id: string, dto: UpdateTenantRecordDto, user: AuthUser) {
    await this.get(id, user);
    const item = await this.delegate().update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    await this.audit(user, "update", id, { dto });
    return item;
  }

  async archive(id: string, user: AuthUser) {
    await this.get(id, user);
    const item = await this.delegate().update({
      where: { id },
      data: this.config.archiveData || { status: "ARCHIVED" },
    });
    await this.audit(user, "archive", id);
    return item;
  }

  protected toCreateData(dto: CreateTenantRecordDto, tenantId: string) {
    return this.config.createData(dto, tenantId);
  }

  protected toUpdateData(dto: UpdateTenantRecordDto) {
    if (this.config.updateData) return this.config.updateData(dto);
    return Object.fromEntries(
      Object.entries({
        title: dto.title,
        status: dto.status,
      }).filter(([, value]) => value !== undefined),
    );
  }

  protected async audit(user: AuthUser, action: string, resourceId: string, metadata: Record<string, unknown> = {}) {
    await this.prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.sub,
        action,
        resource: this.model,
        resourceId,
        metadata: metadata as any,
      },
    });
  }

  protected async recordScope(user: AuthUser): Promise<RecordScope> {
    const roles = user.roles || [];
    if (roles.some((role) => UNRESTRICTED_ROLES.includes(role))) {
      return { mode: "unrestricted", clientIds: [], staffId: null, sharedOnly: false, ownThreads: false };
    }

    const tenantId = user.tenantId ?? undefined;

    if (roles.includes(Role.FAMILY_USER)) {
      const links = await this.prisma.clientFamily.findMany({
        where: { userId: user.sub, ...(tenantId ? { tenantId } : {}) },
        select: { clientId: true },
      });
      return {
        mode: "filtered",
        clientIds: links.map((link) => link.clientId),
        staffId: null,
        sharedOnly: true,
        ownThreads: true,
      };
    }

    if (roles.includes(Role.PRACTITIONER)) {
      const links = await this.prisma.clientPractitioner.findMany({
        where: { userId: user.sub, ...(tenantId ? { tenantId } : {}) },
        select: { clientId: true },
      });
      return {
        mode: "filtered",
        clientIds: links.map((link) => link.clientId),
        staffId: null,
        sharedOnly: false,
        ownThreads: true,
      };
    }

    if (roles.includes(Role.CARE_COORDINATOR)) {
      const clients = await this.prisma.client.findMany({
        where: { coordinatorUserId: user.sub, ...(tenantId ? { tenantId } : {}) },
        select: { id: true },
      });
      return {
        mode: "filtered",
        clientIds: clients.map((client) => client.id),
        staffId: null,
        sharedOnly: false,
        ownThreads: false,
      };
    }

    if (roles.includes(Role.SUPPORT_WORKER)) {
      const staff = await this.prisma.staff.findFirst({
        where: { userId: user.sub, ...(tenantId ? { tenantId } : {}) },
        select: { id: true },
      });
      const shifts = staff
        ? await this.prisma.shift.findMany({
            where: { staffId: staff.id, clientId: { not: null } },
            select: { clientId: true },
          })
        : [];
      return {
        mode: "filtered",
        clientIds: [...new Set(shifts.map((shift) => shift.clientId).filter((id): id is string => Boolean(id)))],
        staffId: staff?.id ?? null,
        sharedOnly: false,
        ownThreads: true,
      };
    }

    return { mode: "unrestricted", clientIds: [], staffId: null, sharedOnly: false, ownThreads: false };
  }

  protected async scopedWhere(
    user: AuthUser,
    extra: Record<string, unknown> = {},
    model = this.model,
  ) {
    const base = {
      ...(user.tenantId ? { tenantId: user.tenantId } : {}),
      ...extra,
    };
    const filter = await this.scopeFilter(user, model);
    if (!filter) return base;
    return { AND: [base, filter] };
  }

  protected async scopeFilter(
    user: AuthUser,
    model = this.model,
  ): Promise<Record<string, unknown> | null> {
    const scope = await this.recordScope(user);
    if (scope.mode === "unrestricted") return null;

    switch (model) {
      case "client":
        return { id: inIds(scope.clientIds) };
      case "shift":
        if (scope.staffId) return { staffId: scope.staffId };
        return { clientId: inIds(scope.clientIds) };
      case "timesheet":
        return { staffId: scope.staffId || NONE_ID };
      case "staff":
        return { id: scope.staffId || NONE_ID };
      case "careNote":
        return {
          clientId: inIds(scope.clientIds),
          ...(scope.sharedOnly ? { sharedWithFamily: true } : {}),
        };
      case "document":
        return {
          clientId: inIds(scope.clientIds),
          ...(scope.sharedOnly ? { sharedWithFamily: true } : {}),
        };
      case "carePlan":
      case "medication":
      case "incident":
      case "invoice":
      case "claim":
        return { clientId: inIds(scope.clientIds) };
      case "notification":
        return { OR: [{ userId: user.sub }, { userId: null }] };
      default:
        return null;
    }
  }
}
