import {
  DEMO_SUBSCRIPTION,
  planHasFeature,
  type PlanId,
} from "@/lib/plans";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { useMemo } from "react";

export function useSubscription() {
  const sub = DEMO_SUBSCRIPTION;
  const { plans } = usePlanCatalog();

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

  const staffPct = Math.min(
    100,
    Math.round((sub.seats.used / (sub.seats.total || 1)) * 100),
  );
  const storagePct = Math.min(
    100,
    Math.round((sub.storageGb.used / (sub.storageGb.total || 1)) * 100),
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
    seats: sub.seats,
    storageGb: sub.storageGb,
    staffPct,
    storagePct,
    canAccess,
  };
}
