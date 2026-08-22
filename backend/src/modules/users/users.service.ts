import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { MailService } from "@/mail/mail.service";
import { issueSetPasswordInvite } from "@/common/utils/password-invite";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const STAFF_LOGIN_ROLES: Role[] = [Role.SUPPORT_WORKER, Role.CARE_COORDINATOR];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async list(query: PaginationDto, user: AuthUser) {
    const where = user.tenantId ? { tenantId: user.tenantId } : {};
    const page = query.page || 1;
    const limit = query.limit || 100;
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
    const { role, password, ...rest } = dto;
    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
    const item = await this.prisma.user.create({
      data: {
        ...rest,
        email: rest.email.toLowerCase().trim(),
        tenantId: user.tenantId || dto.tenantId,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
    if (role) {
      await this.prisma.roleAssignment.create({
        data: { userId: item.id, role, tenantId: item.tenantId || user.tenantId },
      });
    }
    await this.audit(user, "create", item.id);
    if (role && STAFF_LOGIN_ROLES.includes(role) && item.tenantId) {
      const existingStaff = await this.prisma.staff.findFirst({ where: { userId: item.id } });
      if (!existingStaff) {
        await this.prisma.staff.create({
          data: {
            tenantId: item.tenantId,
            userId: item.id,
            title: item.fullName,
            status: "ACTIVE",
            skills: [],
          },
        });
      }
      if (!passwordHash) {
        const org = (
          await this.prisma.tenant.findUnique({
            where: { id: item.tenantId },
            select: { name: true },
          })
        )?.name;
        await issueSetPasswordInvite({
          prisma: this.prisma,
          mail: this.mail,
          config: this.config,
          user: { id: item.id, email: item.email, fullName: item.fullName },
          organization: org,
        });
      }
    }
    return this.get(item.id, user);
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
