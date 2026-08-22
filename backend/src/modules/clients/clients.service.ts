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
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { MailService } from "@/mail/mail.service";
import { issueSetPasswordInvite } from "@/common/utils/password-invite";

const BCRYPT_ROUNDS = 12;
const FAMILY_INCLUDE = {
  coordinator: { select: { id: true, fullName: true } },
  familyLinks: {
    include: { user: { select: { id: true, fullName: true, email: true } } },
  },
} as const;

@Injectable()
export class ClientsService extends TenantCrudService {
  constructor(
    prisma: PrismaService,
    private readonly mail: MailService,
    private readonly appConfig: ConfigService,
  ) {
    super(prisma, "client", {
      createData: (dto, tenantId) => ({
        tenantId,
        fullName: dto.title,
        status: dto.status || "ACTIVE",
        riskLevel: dto.severity,
        funding: (dto.metadata?.funding as string) || undefined,
        coordinatorUserId: (dto.metadata?.coordinatorUserId as string) || undefined,
      }),
      updateData: (dto) => ({
        fullName: dto.title,
        status: dto.status,
        riskLevel: dto.severity,
        funding: dto.metadata?.funding as string | undefined,
        coordinatorUserId: (dto.metadata?.coordinatorUserId as string) || undefined,
      }),
    });
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, status ? { status: status.toUpperCase() } : {});
    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: FAMILY_INCLUDE,
      }),
      this.prisma.client.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    if (!tenantId) throw new BadRequestException("Tenant required");

    const coordinatorUserId = user.roles.includes(Role.CARE_COORDINATOR)
      ? user.sub
      : (dto.metadata?.coordinatorUserId as string | undefined);

    const familyEmail = String(dto.metadata?.familyEmail || "")
      .toLowerCase()
      .trim();
    const familyName =
      String(dto.metadata?.familyName || "").trim() ||
      (familyEmail ? `Family of ${dto.title}` : "");
    const familyPassword = String(dto.metadata?.familyPassword || "").trim();

    if (familyEmail) {
      if (!familyEmail.includes("@")) {
        throw new BadRequestException("Family email is invalid");
      }
      if (familyPassword && familyPassword.length < 8) {
        throw new BadRequestException("Family password must be at least 8 characters");
      }
    }

    const created = await super.create(
      {
        ...dto,
        metadata: { ...dto.metadata, coordinatorUserId },
      },
      user,
    );

    let familyInviteSent = false;
    let familyLoginEmail: string | undefined;

    if (familyEmail) {
      const invite = await this.linkFamilyContact({
        tenantId,
        clientId: created.id,
        email: familyEmail,
        fullName: familyName,
        password: familyPassword,
      });
      familyInviteSent = invite.inviteSent;
      familyLoginEmail = familyEmail;
    }

    const item = await this.prisma.client.findFirst({
      where: { id: created.id },
      include: FAMILY_INCLUDE,
    });
    return { ...item, familyInviteSent, familyLoginEmail };
  }

  private async linkFamilyContact(params: {
    tenantId: string;
    clientId: string;
    email: string;
    fullName: string;
    password?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: params.email },
      include: { roles: true },
    });

    let userId: string;
    let inviteNeeded = !params.password;

    if (existing) {
      if (existing.tenantId && existing.tenantId !== params.tenantId) {
        throw new ConflictException("This family email is already used in another organisation");
      }
      const roles = existing.roles.map((row) => row.role);
      if (roles.length && !roles.includes(Role.FAMILY_USER)) {
        throw new ConflictException("This email belongs to an existing account that is not a family user");
      }
      if (!existing.tenantId) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { tenantId: params.tenantId, fullName: params.fullName },
        });
      }
      if (!roles.includes(Role.FAMILY_USER)) {
        await this.prisma.roleAssignment.create({
          data: { userId: existing.id, role: Role.FAMILY_USER, tenantId: params.tenantId },
        });
      }
      userId = existing.id;
      inviteNeeded = !existing.passwordHash && !params.password;
      if (params.password) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: await bcrypt.hash(params.password, BCRYPT_ROUNDS),
            isActive: true,
          },
        });
        inviteNeeded = false;
      }
    } else {
      const createdUser = await this.prisma.user.create({
        data: {
          email: params.email,
          fullName: params.fullName,
          tenantId: params.tenantId,
          isActive: true,
          ...(params.password
            ? { passwordHash: await bcrypt.hash(params.password, BCRYPT_ROUNDS) }
            : {}),
          roles: { create: { role: Role.FAMILY_USER, tenantId: params.tenantId } },
        },
      });
      userId = createdUser.id;
    }

    await this.prisma.clientFamily.upsert({
      where: { clientId_userId: { clientId: params.clientId, userId } },
      create: { tenantId: params.tenantId, clientId: params.clientId, userId },
      update: {},
    });

    if (!inviteNeeded) return { inviteSent: false };

    const org = (
      await this.prisma.tenant.findUnique({
        where: { id: params.tenantId },
        select: { name: true },
      })
    )?.name;
    await issueSetPasswordInvite({
      prisma: this.prisma,
      mail: this.mail,
      config: this.appConfig,
      user: { id: userId, email: params.email, fullName: params.fullName },
      organization: org,
      kind: "family",
    });
    return { inviteSent: true };
  }
}
