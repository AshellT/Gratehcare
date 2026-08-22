import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { SubscriptionsService } from "@/modules/subscriptions/subscriptions.service";
import { AuthUser } from "../types/auth-user.type";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const WHITELIST_PREFIXES = [
  "/api/v1/auth",
  "/api/v1/public",
  "/api/v1/subscription-billing/stripe/webhook",
];
const WHITELIST_SUFFIXES = [
  "/subscription/upgrade-request",
  "/oauth/complete",
  "/subscription-billing/checkout",
  "/subscription-billing/change-plan",
  "/subscription-billing/portal",
];

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = String(request.method || "GET").toUpperCase();

    if (READ_METHODS.has(method)) {
      return true;
    }

    const path = String(request.originalUrl || request.url || "").split("?")[0];
    if (this.isWhitelisted(path)) {
      return true;
    }

    const user = request.user as AuthUser | undefined;
    if (!user?.tenantId) {
      return true;
    }

    if (this.subscriptions.canBypassSubscription(user.roles as Role[])) {
      return true;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { planId: true, subscriptionStatus: true, trialEndsAt: true },
    });
    if (!tenant) {
      return true;
    }

    const subscription = this.subscriptions.resolveSubscription(tenant);
    if (!subscription.isReadOnly) {
      return true;
    }

    throw new ForbiddenException({
      code: "TRIAL_EXPIRED",
      message:
        "Your 14-day trial has ended. Upgrade your plan to continue making changes.",
      upgradeUrl: "/app/plans",
    });
  }

  private isWhitelisted(path: string): boolean {
    if (WHITELIST_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return true;
    }
    return WHITELIST_SUFFIXES.some((suffix) => path.endsWith(suffix));
  }
}
