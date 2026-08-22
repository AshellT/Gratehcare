import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { MailService } from "@/mail/mail.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

const VALID_PLAN_IDS = new Set(["start", "pro", "elite"]);
const BCRYPT_ROUNDS = 12;
const RESET_TTL_MS = 60 * 60 * 1000;

const normalizePlanId = (planId?: string) =>
  planId && VALID_PLAN_IDS.has(planId) ? planId : "pro";

const trialEndsAtFromNow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
};

const slugify = (name: string) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "org"}-${randomUUID().slice(0, 8)}`;
};

type UserWithRoles = {
  id: string;
  email: string;
  fullName: string;
  tenantId: string | null;
  avatarColor: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  passwordHash: string | null;
  roles: { role: Role }[];
  tenant?: { name: string } | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const orgName = dto.organizationName?.trim() || "My Organization";
    const role = Role.ORGANIZATION_OWNER;

    let tenantId = dto.tenantId ?? null;
    if (!tenantId) {
      const tenant = await this.prisma.tenant.create({
        data: {
          name: orgName,
          slug: slugify(orgName),
          planId: normalizePlanId(dto.planId),
          subscriptionStatus: "trial",
          trialEndsAt: trialEndsAtFromNow(),
        },
      });
      tenantId = tenant.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        passwordHash,
        tenantId,
        roles: {
          create: { role, tenantId },
        },
      },
      include: { roles: true, tenant: true },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true, tenant: true },
    });

    if (!user?.passwordHash || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueTokens(user);
  }

  async resolveAuthUser(accessToken: string): Promise<AuthUser> {
    const payload = await this.verifyToken(accessToken, "access");
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException("Invalid bearer token");
    }
    return this.toAuthPayload(user);
  }

  async me(user: AuthUser) {
    const record = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: { roles: true, tenant: true },
    });
    if (!record?.isActive) {
      throw new UnauthorizedException("Invalid session");
    }
    return this.toSessionUser(record);
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, "refresh");
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true, tenant: true },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return this.issueTokens(user);
  }

  async forgotPassword(emailRaw: string) {
    const email = emailRaw.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.isActive) {
      return { ok: true };
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    const frontend = this.frontendUrl();
    const resetUrl = `${frontend}/reset-password?token=${token}`;
    await this.mail.send({
      to: user.email,
      subject: "Reset your GRATEHCARE password",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
          <h1 style="font-size:22px">Reset your password</h1>
          <p>We received a request to reset the password for <strong>${user.email}</strong>.</p>
          <p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">Choose a new password</a></p>
          <p style="color:#64748b;font-size:13px">This link expires in 1 hour. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    });

    if (!this.config.get<string>("RESEND_API_KEY") && !this.config.get<string>("SMTP_HOST")) {
      this.loggerResetLink(resetUrl);
    }

    return { ok: true };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { roles: true, tenant: true } } },
    });
    if (!record) {
      throw new BadRequestException("This reset link is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }

  private async issueTokens(user: UserWithRoles) {
    const payload = this.toAuthPayload(user);
    const secret = this.jwtSecret();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...payload, typ: "access" },
        { secret, expiresIn: this.config.get<string>("JWT_EXPIRES_IN") || "1d" },
      ),
      this.jwt.signAsync(
        { sub: user.id, typ: "refresh" },
        {
          secret,
          expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d",
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user: this.toSessionUser(user),
      tenantId: user.tenantId,
    };
  }

  private async verifyToken(token: string, typ: "access" | "refresh") {
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        typ?: string;
        email?: string;
        tenantId?: string | null;
        roles?: Role[];
      }>(token, { secret: this.jwtSecret() });
      if (payload.typ && payload.typ !== typ) {
        throw new UnauthorizedException("Invalid token type");
      }
      if (!payload.sub) {
        throw new UnauthorizedException("Invalid token");
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(typ === "refresh" ? "Invalid refresh token" : "Invalid bearer token");
    }
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

  private toSessionUser(user: UserWithRoles) {
    return {
      ...this.toAuthPayload(user),
      id: user.id,
      fullName: user.fullName,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl,
      organization: user.tenant?.name ?? "My Organization",
    };
  }

  private jwtSecret() {
    const secret = this.config.get<string>("JWT_SECRET")?.trim();
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    return secret;
  }

  private frontendUrl() {
    return (
      this.config.get<string>("FRONTEND_URL")?.trim().replace(/\/$/, "") ||
      this.config.get<string>("CORS_ORIGIN")?.split(",")[0]?.trim().replace(/\/$/, "") ||
      "http://localhost:3000"
    );
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private loggerResetLink(url: string) {
    // eslint-disable-next-line no-console
    console.warn(`[auth] Password reset URL (email not configured): ${url}`);
  }
}
