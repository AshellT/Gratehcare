import {
  DEMO_SUBSCRIPTION,
  planHasFeature,
  type PlanId,
} from "@/lib/plans";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { useAuth } from "@/context/AuthContext";
import { tenantsApi, type OrganizationCurrent } from "@/lib/api/tenants";
import { readSignupPlan } from "@/lib/signupPlan";
import { useCallback, useEffect, useMemo, useState } from "react";

type SubscriptionState = typeof DEMO_SUBSCRIPTION & {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isReadOnly: boolean;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
};

const parseLimit = (value: number | "unlimited" | undefined, fallback: number) => {
  if (value === "unlimited") return fallback;
  if (typeof value === "number") return value;
  return fallback;
};

const buildFallbackState = (planId: PlanId): SubscriptionState => ({
  ...DEMO_SUBSCRIPTION,
  planId,
  status: "trial",
  trialEndsAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  isTrialActive: true,
  isTrialExpired: false,
  isReadOnly: false,
  stripeSubscriptionId: null,
  stripeCustomerId: null,
});

const mapOrganizationToState = (
  org: OrganizationCurrent,
  fallbackPlanId: PlanId,
): SubscriptionState => {
  const subscription = org.subscription;
  const planId = (subscription?.planId || org.planId || fallbackPlanId) as PlanId;
  const status = (subscription?.status || org.subscriptionStatus || "trial") as SubscriptionState["status"];
  const trialEndsAt =
    subscription?.trialEndsAt ||
    (org.trialEndsAt ? new Date(org.trialEndsAt).toISOString() : null);
  const periodEnd = org.currentPeriodEnd
    ? new Date(org.currentPeriodEnd).toISOString().slice(0, 10)
    : trialEndsAt
      ? trialEndsAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  return {
    planId,
    cycle: "monthly",
    status,
    trialEndsAt,
    currentPeriodEnd: periodEnd,
    seats: { used: 0, total: 0 },
    storageGb: { used: 0, total: 0 },
    isTrialActive: subscription?.isTrialActive ?? false,
    isTrialExpired: subscription?.isTrialExpired ?? false,
    isReadOnly: subscription?.isReadOnly ?? false,
    stripeSubscriptionId: org.stripeSubscriptionId ?? null,
    stripeCustomerId: org.stripeCustomerId ?? null,
  };
};

export function useSubscription() {
  const { user } = useAuth();
  const fallbackPlanId = readSignupPlan() || DEMO_SUBSCRIPTION.planId;
  const [sub, setSub] = useState<SubscriptionState>(() => buildFallbackState(fallbackPlanId));
  const { plans } = usePlanCatalog();

  const refresh = useCallback(async () => {
    if (!user?.organization_id) return;
    try {
      const org = await tenantsApi.getCurrent();
      setSub(mapOrganizationToState(org, fallbackPlanId));
    } catch {
      // keep existing state
    }
  }, [user?.organization_id, fallbackPlanId]);

  useEffect(() => {
    if (!user?.organization_id) return;
    let mounted = true;

    (async () => {
      try {
        const org = await tenantsApi.getCurrent();
        if (!mounted) return;
        setSub(mapOrganizationToState(org, fallbackPlanId));
      } catch {
        // keep local fallback
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.organization_id, fallbackPlanId]);

  const plan = useMemo(
    () => plans.find((p) => p.id === sub.planId) ?? plans[1],
    [plans, sub.planId],
  );

  const daysLeftInTrial = useMemo(() => {
    if (sub.isTrialActive === false && sub.trialEndsAt) {
      const msLeft = new Date(sub.trialEndsAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(msLeft / 86_400_000));
    }
    if (!sub.trialEndsAt) return null;
    const msLeft = new Date(sub.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(msLeft / 86_400_000));
  }, [sub.trialEndsAt, sub.isTrialActive]);

  const daysLeftInPeriod = useMemo(() => {
    const msLeft = new Date(sub.currentPeriodEnd).getTime() - Date.now();
    return Math.max(0, Math.ceil(msLeft / 86_400_000));
  }, [sub.currentPeriodEnd]);

  const staffTotal = parseLimit(plan.limits.staff, sub.seats.total);
  const storageTotal =
    typeof plan.limits.storage === "string"
      ? sub.storageGb.total
      : Number(plan.limits.storage) || sub.storageGb.total;

  const staffPct = Math.min(
    100,
    Math.round((sub.seats.used / (staffTotal || 1)) * 100),
  );
  const storagePct = Math.min(
    100,
    Math.round((sub.storageGb.used / (storageTotal || 1)) * 100),
  );

  function canAccess(featureKey: string): boolean {
    return planHasFeature(sub.planId as PlanId, featureKey);
  }

  return {
    plan,
    planId: sub.planId as PlanId,
    cycle: sub.cycle,
    status: sub.status,
    trialEndsAt: sub.trialEndsAt,
    daysLeftInTrial,
    currentPeriodEnd: sub.currentPeriodEnd,
    daysLeftInPeriod,
    seats: { ...sub.seats, total: staffTotal },
    storageGb: { ...sub.storageGb, total: storageTotal },
    staffPct,
    storagePct,
    canAccess,
    isTrialActive: sub.isTrialActive,
    isTrialExpired: sub.isTrialExpired,
    isReadOnly: sub.isReadOnly,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    stripeCustomerId: sub.stripeCustomerId,
    refresh,
  };
}
