import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "@/prisma/prisma.service";
import { SupabaseService } from "@/supabase/supabase.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { LoginDto } from "./dto/login.dto";
import { OAuthCompleteDto } from "./dto/oauth-complete.dto";
import { RegisterDto } from "./dto/register.dto";
import { prismaRoleToSupabase, supabaseRoleToPrisma } from "./role-map";

const TEST_EMAIL_DOMAIN = "@gratehcare.test";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  async register(dto: RegisterDto) {
    if (this.isTestEmail(dto.email)) {
      throw new BadRequestException("Test accounts cannot be registered through this endpoint");
    }

    const supabaseRole = prismaRoleToSupabase[dto.role];
    const { data, error } = await this.supabase.signUp(dto.email, dto.password, {
      full_name: dto.fullName,
      role: supabaseRole,
      organization_name: dto.organizationName ?? "My Organization",
    });

    if (error) throw new BadRequestException(error.message);
    if (!data.user) throw new BadRequestException("Supabase signup did not return a user");

    const user = await this.syncFromSupabaseUser(data.user, {
      role: dto.role,
      tenantId: dto.tenantId,
      fullName: dto.fullName,
    });

    if (data.session?.access_token) {
      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: this.toAuthPayload(user),
      };
    }

    return {
      message: "Check your email to confirm your account before signing in.",
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    if (this.isTestEmail(email)) {
      return this.loginTestAccount(email, dto.password);
    }

    const { data, error } = await this.supabase.signInWithPassword(email, dto.password);
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const user = await this.syncFromSupabaseUser(data.user);
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: this.toAuthPayload(user),
    };
  }

  async resolveAuthUser(accessToken: string): Promise<AuthUser> {
    const supabaseUser = await this.supabase.getUserFromAccessToken(accessToken);
    if (supabaseUser) {
      const user = await this.syncFromSupabaseUser(supabaseUser);
      return this.toAuthPayload(user);
    }

    try {
      const payload = await this.jwt.verifyAsync<AuthUser>(accessToken, {
        secret: this.config.get<string>("JWT_SECRET"),
      });
      return payload;
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }

  async completeOAuthSession(accessToken: string, dto: OAuthCompleteDto) {
    const supabaseUser = await this.supabase.getUserFromAccessToken(accessToken);
    if (!supabaseUser) {
      throw new UnauthorizedException("Invalid OAuth session");
    }

    const email = (supabaseUser.email || "").toLowerCase();
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: supabaseUser.id }, { email }],
      },
      include: { roles: true },
    });

    if (dto.organizationName?.trim() && !existing) {
      const orgName = dto.organizationName.trim();
      const fullName =
        typeof supabaseUser.user_metadata?.full_name === "string"
          ? supabaseUser.user_metadata.full_name
          : typeof supabaseUser.user_metadata?.name === "string"
            ? supabaseUser.user_metadata.name
            : email.split("@")[0];

      await this.supabase.updateUserMetadata(supabaseUser.id, {
        organization_name: orgName,
        role: prismaRoleToSupabase[Role.ORGANIZATION_OWNER],
        full_name: fullName,
      });

      supabaseUser.user_metadata = {
        ...supabaseUser.user_metadata,
        organization_name: orgName,
        role: prismaRoleToSupabase[Role.ORGANIZATION_OWNER],
        full_name: fullName,
      };
    }

    const user = await this.syncFromSupabaseUser(supabaseUser);
    const payload = {
      ...this.toAuthPayload(user),
      fullName: user.fullName,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl ?? null,
    };

    return {
      accessToken,
      user: payload,
      tenantId: user.tenantId,
    };
  }

  private async loginTestAccount(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!user?.isTestAccount || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueLocalToken(user);
  }

  private async syncFromSupabaseUser(
    supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
    overrides?: { role?: Role; tenantId?: string | null; fullName?: string },
  ) {
    const email = (supabaseUser.email || "").toLowerCase();
    const meta = supabaseUser.user_metadata ?? {};
    const metaRole = typeof meta.role === "string" ? supabaseRoleToPrisma[meta.role] : undefined;
    const role = overrides?.role ?? metaRole ?? Role.ORGANIZATION_OWNER;
    const fullName =
      overrides?.fullName ||
      (typeof meta.full_name === "string" ? meta.full_name : email.split("@")[0]);
    const avatarColor = typeof meta.avatar_color === "string" ? meta.avatar_color : null;
    const isTest = this.isTestEmail(email);

    let tenantId = overrides?.tenantId ?? null;
    if (!tenantId && typeof meta.organization_id === "string") {
      tenantId = meta.organization_id;
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: supabaseUser.id }, { email }],
      },
      include: { roles: true },
    });

    if (existing) {
      const updated = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseId: supabaseUser.id,
          email,
          fullName,
          avatarColor,
          isTestAccount: isTest,
          tenantId: tenantId ?? existing.tenantId,
        },
        include: { roles: true },
      });

      if (!updated.roles.some((assignment) => assignment.role === role)) {
        await this.prisma.roleAssignment.create({
          data: {
            userId: updated.id,
            role,
            tenantId: updated.tenantId,
          },
        });
      }

      return this.prisma.user.findUniqueOrThrow({
        where: { id: updated.id },
        include: { roles: true },
      });
    }

    if (!tenantId && !isTest) {
      const tenant = await this.prisma.tenant.create({
        data: {
          name:
            (typeof meta.organization_name === "string" && meta.organization_name) ||
            "My Organization",
          slug: `org-${supabaseUser.id.slice(0, 8)}`,
        },
      });
      tenantId = tenant.id;
    }

    return this.prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        fullName,
        avatarColor,
        isTestAccount: isTest,
        tenantId,
        roles: {
          create: { role, tenantId },
        },
      },
      include: { roles: true },
    });
  }

  private async issueLocalToken(user: {
    id: string;
    email: string;
    fullName: string;
    tenantId: string | null;
    avatarColor?: string | null;
    avatarUrl?: string | null;
    roles: { role: Role }[];
  }) {
    const payload = {
      ...this.toAuthPayload(user),
      fullName: user.fullName,
      avatarColor: user.avatarColor ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };
    return {
      accessToken: await this.jwt.signAsync(this.toAuthPayload(user), {
        secret: this.config.get<string>("JWT_SECRET"),
        expiresIn: this.config.get<string>("JWT_EXPIRES_IN") || "1d",
      }),
      user: payload,
    };
  }

  private toAuthPayload(user: {
    id: string;
    email: string;
    tenantId: string | null;
    roles: { role: Role }[];
  }): AuthUser {
    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles.map((assignment) => assignment.role),
    };
  }

  private isTestEmail(email: string) {
    return email.toLowerCase().endsWith(TEST_EMAIL_DOMAIN);
  }
}
