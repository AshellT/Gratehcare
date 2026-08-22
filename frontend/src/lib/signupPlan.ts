import type { PlanId } from "@/lib/plans";

export const SIGNUP_PLAN_KEY = "gratehcare.signup.plan";

const VALID_PLANS = new Set<PlanId>(["start", "pro", "elite"]);

export function parseSignupPlan(value: string | null | undefined): PlanId | null {
  if (!value) return null;
  return VALID_PLANS.has(value as PlanId) ? (value as PlanId) : null;
}

export function buildRegisterPath(plan?: PlanId | null) {
  return plan ? `/register?plan=${plan}` : "/register";
}

export function buildDemoPath(options?: {
  type?: "demo" | "enterprise";
  plan?: PlanId | null;
  source?: string;
}) {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.plan) params.set("plan", options.plan);
  if (options?.source) params.set("source", options.source);
  const query = params.toString();
  return query ? `/book-demo?${query}` : "/book-demo";
}

export function persistSignupPlan(planId: PlanId) {
  try {
    localStorage.setItem(SIGNUP_PLAN_KEY, planId);
  } catch {
    // ignore
  }
}

export function readSignupPlan(): PlanId | null {
  try {
    return parseSignupPlan(localStorage.getItem(SIGNUP_PLAN_KEY));
  } catch {
    return null;
  }
}

const SIGNUP_CHECKOUT_KEY = "gratehcare.signup.checkout";

export function setCheckoutIntent(planId: PlanId) {
  try {
    sessionStorage.setItem(SIGNUP_CHECKOUT_KEY, planId);
  } catch {
    // ignore
  }
}

export function takeCheckoutIntent(): PlanId | null {
  try {
    const plan = parseSignupPlan(sessionStorage.getItem(SIGNUP_CHECKOUT_KEY));
    sessionStorage.removeItem(SIGNUP_CHECKOUT_KEY);
    return plan;
  } catch {
    return null;
  }
}

export function clearCheckoutIntent() {
  try {
    sessionStorage.removeItem(SIGNUP_CHECKOUT_KEY);
  } catch {
    // ignore
  }
}
