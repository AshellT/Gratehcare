import { Injectable } from "@nestjs/common";
import { Tenant } from "@prisma/client";

export type ResolvedSubscription = {
  status: string;
  planId: string;
  trialEndsAt: string | null;
  daysLeftInTrial: number | null;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isReadOnly: boolean;
};

const BYPASS_ROLES = new Set(["PLATFORM_OWNER", "SUPER_ADMIN", "PLATFORM_SUPPORT"]);

@Injectable()
export class SubscriptionsService {
  resolveSubscription(tenant: Pick<Tenant, "planId" | "subscriptionStatus" | "trialEndsAt">): ResolvedSubscription {
    const now = Date.now();
    const status = tenant.subscriptionStatus || "trial";
    const planId = tenant.planId || "pro";
    const trialEndsAt = tenant.trialEndsAt ? tenant.trialEndsAt.toISOString() : null;

    const daysLeftInTrial =
      tenant.trialEndsAt != null
        ? Math.max(0, Math.ceil((tenant.trialEndsAt.getTime() - now) / 86_400_000))
        : null;

    const isTrial = status === "trial";
    const isTrialActive = isTrial && tenant.trialEndsAt != null && tenant.trialEndsAt.getTime() > now;
    const isTrialExpired = isTrial && tenant.trialEndsAt != null && tenant.trialEndsAt.getTime() <= now;
    const isReadOnly = isTrialExpired || status === "past_due" || status === "expired";

    return {
      status,
      planId,
      trialEndsAt,
      daysLeftInTrial: isTrial ? daysLeftInTrial : null,
      isTrialActive,
      isTrialExpired,
      isReadOnly,
    };
  }

  canBypassSubscription(roles: string[] | undefined): boolean {
    return (roles ?? []).some((role) => BYPASS_ROLES.has(role));
  }
}
