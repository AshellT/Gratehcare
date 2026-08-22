import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { CreateTenantRecordDto, UpdateTenantRecordDto } from "@/common/dto/tenant-record.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { MailService } from "@/mail/mail.service";
import { issueSetPasswordInvite } from "@/common/utils/password-invite";

const BCRYPT_ROUNDS = 12;
const STAFF_LOGIN_ROLES: Role[] = [Role.SUPPORT_WORKER, Role.CARE_COORDINATOR];
const USER_INCLUDE = {
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      roles: { select: { role: true } },
    },
  },
} as const;

@Injectable()
export class StaffService extends TenantCrudService {
  constructor(
    prisma: PrismaService,
    private readonly mail: MailService,
    private readonly appConfig: ConfigService,
  ) {
    super(prisma, "staff", {
      createData: (dto, tenantId) => ({
        tenantId,
        title: dto.title,
        status: dto.status || "ACTIVE",
        skills: Array.isArray(dto.metadata?.skills)
          ? (dto.metadata?.skills as string[])
          : [],
      }),
      updateData: (dto) => ({
        title: dto.title,
        status: dto.status,
        skills: Array.isArray(dto.metadata?.skills)
          ? (dto.metadata?.skills as string[])
          : undefined,
      }),
    });
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const where = await this.scopedWhere(user);
    const [items, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: USER_INCLUDE,
      }),
      this.prisma.staff.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    if (!tenantId) throw new BadRequestException("Tenant required");

    const fullName = dto.title?.trim();
    if (!fullName) throw new BadRequestException("Full name is required");

    const email = String(dto.metadata?.email || "")
      .toLowerCase()
      .trim();
    if (!email || !email.includes("@")) {
      throw new BadRequestException("Work email is required so the staff member can sign in");
    }

    const password = String(dto.metadata?.password || "").trim();
    if (password && password.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }

    const requested = String(dto.metadata?.role || Role.SUPPORT_WORKER).toUpperCase();
    const role = STAFF_LOGIN_ROLES.includes(requested as Role)
      ? (requested as Role)
      : Role.SUPPORT_WORKER;

    const skills = Array.isArray(dto.metadata?.skills)
      ? (dto.metadata?.skills as string[])
      : [];
    const status = dto.status || "ACTIVE";

    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { staffProfile: true, roles: true, tenant: { select: { name: true } } },
    });

    let userId: string;
    let inviteNeeded = !password;

    if (existing) {
      if (existing.tenantId && existing.tenantId !== tenantId) {
        throw new ConflictException("This email is already used in another organisation");
      }
      if (existing.staffProfile) {
        throw new ConflictException("This email already has a staff profile");
      }
      const existingRoles = existing.roles.map((row) => row.role);
      if (
        existingRoles.length &&
        !existingRoles.some((assigned) => STAFF_LOGIN_ROLES.includes(assigned))
      ) {
        throw new ConflictException(
          "This email belongs to an existing account that is not a staff role",
        );
      }
      if (!existing.tenantId) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { tenantId, fullName },
        });
      }
      if (!existingRoles.includes(role)) {
        await this.prisma.roleAssignment.create({
          data: { userId: existing.id, role, tenantId },
        });
      }
      userId = existing.id;
      inviteNeeded = !existing.passwordHash && !password;
      if (password) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS), isActive: true },
        });
        inviteNeeded = false;
      }
    } else {
      const createdUser = await this.prisma.user.create({
        data: {
          email,
          fullName,
          tenantId,
          isActive: true,
          ...(password ? { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) } : {}),
          roles: { create: { role, tenantId } },
        },
      });
      userId = createdUser.id;
    }

    const item = await this.prisma.staff.create({
      data: {
        tenantId,
        userId,
        title: fullName,
        status,
        skills,
      },
      include: USER_INCLUDE,
    });

    let inviteSent = false;
    if (inviteNeeded) {
      const org =
        existing?.tenant?.name ||
        (
          await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { name: true },
          })
        )?.name;
      await issueSetPasswordInvite({
        prisma: this.prisma,
        mail: this.mail,
        config: this.appConfig,
        user: { id: userId, email, fullName },
        organization: org,
      });
      inviteSent = true;
    }

    await this.audit(user, "create", item.id, { email, role, inviteSent });
    return { ...item, inviteSent, loginEmail: email };
  }

  override async update(id: string, dto: UpdateTenantRecordDto, user: AuthUser) {
    const current = await this.get(id, user);
    const updated = await super.update(id, dto, user);
    if (current.userId && dto.title) {
      await this.prisma.user.update({
        where: { id: current.userId },
        data: { fullName: dto.title },
      });
    }
    return this.prisma.staff.findFirst({
      where: { id: updated.id },
      include: USER_INCLUDE,
    });
  }

  override async archive(id: string, user: AuthUser) {
    const current = await this.get(id, user);
    const archived = await super.archive(id, user);
    if (current.userId) {
      await this.prisma.user.update({
        where: { id: current.userId },
        data: { isActive: false },
      });
    }
    return archived;
  }
}
