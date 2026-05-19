import { Injectable, NotFoundException } from "@nestjs/common";
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
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
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
    const item = await this.delegate().findFirst({
      where: { id, ...(user.tenantId ? { tenantId: user.tenantId } : {}) },
    });
    if (!item) throw new NotFoundException(`${this.model} not found`);
    return item;
  }

  async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
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
}
