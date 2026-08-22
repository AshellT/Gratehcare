import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";
import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function frontendBaseUrl(config: ConfigService) {
  return (
    config.get<string>("FRONTEND_URL")?.trim().replace(/\/$/, "") ||
    config.get<string>("CORS_ORIGIN")?.split(",")[0]?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function issueSetPasswordInvite(params: {
  prisma: PrismaService;
  mail: MailService;
  config: ConfigService;
  user: { id: string; email: string; fullName: string };
  organization?: string;
  kind?: "staff" | "family";
}) {
  const token = randomBytes(32).toString("hex");
  await params.prisma.passwordResetToken.create({
    data: {
      userId: params.user.id,
      tokenHash: hashInviteToken(token),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });

  const resetUrl = `${frontendBaseUrl(params.config)}/reset-password?token=${token}`;
  const org = params.organization || "your organisation";
  const asFamily = params.kind === "family";
  await params.mail.send({
    to: params.user.email,
    subject: asFamily
      ? "You're invited to the GRATEHCARE family portal"
      : "You're invited to GRATEHCARE",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h1 style="font-size:22px">Welcome to GRATEHCARE</h1>
        <p>Hi ${params.user.fullName}, you have been added ${
          asFamily
            ? `as a family contact at <strong>${org}</strong>`
            : `as staff at <strong>${org}</strong>`
        }.</p>
        <p>Choose a password to activate your account and sign in.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">Set your password</a></p>
        <p style="color:#64748b;font-size:13px">This link expires in 7 days. After that, use Forgot password on the login page.</p>
      </div>
    `,
  });

  if (!params.config.get<string>("RESEND_API_KEY") && !params.config.get<string>("SMTP_HOST")) {
    // eslint-disable-next-line no-console
    console.warn(`[invite] Set-password URL (email not configured): ${resetUrl}`);
  }

  return { inviteSent: true, resetUrl };
}
