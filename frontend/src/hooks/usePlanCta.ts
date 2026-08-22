import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionBillingApi } from "@/lib/api/subscriptionBilling";
import type { PlanId } from "@/lib/plans";
import {
  buildRegisterPath,
  clearCheckoutIntent,
  persistSignupPlan,
  setCheckoutIntent,
} from "@/lib/signupPlan";

const PLAN_RANK: Record<PlanId, number> = { start: 0, pro: 1, elite: 2 };

export function usePlanCta() {
  const { user } = useAuth();
  const sub = useSubscription();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signedIn = Boolean(user);

  const primaryLabel = (planId: PlanId) => {
    if (!signedIn) return "Start free trial";
    if (sub.planId === planId && sub.stripeSubscriptionId) return "Current plan";
    if (sub.planId === planId) return "Subscribe now";
    return PLAN_RANK[planId] > PLAN_RANK[sub.planId] ? "Upgrade now" : "Switch plan";
  };

  const startTrial = (planId: PlanId) => {
    persistSignupPlan(planId);
    clearCheckoutIntent();
    if (signedIn) {
      navigate("/app/plans");
      return;
    }
    navigate(buildRegisterPath(planId));
  };

  const startCheckout = async (planId: PlanId) => {
    persistSignupPlan(planId);
    setError(null);

    if (!signedIn) {
      setCheckoutIntent(planId);
      navigate(buildRegisterPath(planId));
      return;
    }

    if (sub.planId === planId && sub.stripeSubscriptionId) {
      navigate("/app/plans");
      return;
    }

    setBusyPlan(planId);
    try {
      const result = await subscriptionBillingApi.changePlan(planId);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      navigate("/app/plans");
    } catch (err: any) {
      setError(err?.message || "Could not start Stripe checkout.");
      navigate("/app/plans");
    } finally {
      setBusyPlan(null);
    }
  };

  return {
    signedIn,
    busyPlan,
    error,
    primaryLabel,
    startTrial,
    startCheckout,
  };
}
