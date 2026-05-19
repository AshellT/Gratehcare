import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto, user: AuthUser) {
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    const page = query.page || 1;
    const limit = query.limit || 25;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip: (page - 1) * limit, take: limit, include: { roles: true } }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string, user: AuthUser) {
    const item = await this.prisma.user.findFirst({
      where: { id, ...(user.tenantId ? { tenantId: user.tenantId } : {}) },
      include: { roles: true },
    });
    if (!item) throw new NotFoundException("User not found");
    return item;
  }

  async create(dto: CreateUserDto, user: AuthUser) {
    const item = await this.prisma.user.create({
      data: { ...dto, tenantId: user.tenantId || dto.tenantId },
    });
    await this.audit(user, "create", item.id);
    return item;
  }

  async update(id: string, dto: UpdateUserDto, user: AuthUser) {
    await this.get(id, user);
    const item = await this.prisma.user.update({ where: { id }, data: dto });
    await this.audit(user, "update", id);
    return item;
  }

  async archive(id: string, user: AuthUser) {
    await this.get(id, user);
    const item = await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    await this.audit(user, "archive", id);
    return item;
  }

  private audit(user: AuthUser, action: string, resourceId: string) {
    return this.prisma.auditLog.create({
      data: { tenantId: user.tenantId, actorId: user.sub, action, resource: "user", resourceId },
    });
  }
}
