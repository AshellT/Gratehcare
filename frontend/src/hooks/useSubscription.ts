import {
  DEMO_SUBSCRIPTION,
  planHasFeature,
  type PlanId,
} from "@/lib/plans";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { useAuth } from "@/context/AuthContext";
import { tenantsApi } from "@/lib/api/tenants";
import { readSignupPlan } from "@/lib/signupPlan";
import { useEffect, useMemo, useState } from "react";

type SubscriptionState = typeof DEMO_SUBSCRIPTION;

const parseLimit = (value: number | "unlimited" | undefined, fallback: number) => {
  if (value === "unlimited") return fallback;
  if (typeof value === "number") return value;
  return fallback;
};

const tenantToSubscription = (
  tenant: Record<string, unknown>,
  fallbackPlanId: PlanId,
): SubscriptionState => {
  const planId = (tenant.planId || tenant.plan_id || fallbackPlanId) as PlanId;
  const status = (tenant.subscriptionStatus || tenant.subscription_status || "trial") as
    SubscriptionState["status"];
  const trialEndsAt =
    typeof tenant.trialEndsAt === "string"
      ? tenant.trialEndsAt
      : tenant.trial_ends_at
        ? new Date(tenant.trial_ends_at as string).toISOString()
        : null;

  return {
    planId,
    cycle: "monthly",
    status,
    trialEndsAt,
    currentPeriodEnd: trialEndsAt
      ? trialEndsAt.slice(0, 10)
      : DEMO_SUBSCRIPTION.currentPeriodEnd,
    seats: DEMO_SUBSCRIPTION.seats,
    storageGb: DEMO_SUBSCRIPTION.storageGb,
  };
};

export function useSubscription() {
  const { user } = useAuth();
  const fallbackPlanId = readSignupPlan() || DEMO_SUBSCRIPTION.planId;
  const [sub, setSub] = useState<SubscriptionState>(() => ({
    ...DEMO_SUBSCRIPTION,
    planId: fallbackPlanId,
    status: "trial",
    trialEndsAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  }));
  const { plans } = usePlanCatalog();

  useEffect(() => {
    if (!user?.organization_id) return;
    let mounted = true;

    (async () => {
      try {
        const tenant = (await tenantsApi.getCurrent()) as Record<string, unknown>;
        if (!mounted) return;
        setSub(tenantToSubscription(tenant, fallbackPlanId));
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
    if (!sub.trialEndsAt) return null;
    const msLeft = new Date(sub.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(msLeft / 86_400_000));
  }, [sub.trialEndsAt]);

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
  };
}
