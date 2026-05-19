import {
  getPlanCatalog,
  PLAN_LIST,
  readPlanOverrides,
  resetPlanOverrides,
  savePlanOverride,
  type Plan,
  type PlanId,
  type PlanPriceOverride,
} from "@/lib/plans";
import { useCallback, useEffect, useMemo, useState } from "react";

export function usePlanCatalog() {
  const [plans, setPlans] = useState<Plan[]>(() => getPlanCatalog());

  useEffect(() => {
    const sync = () => setPlans(getPlanCatalog());
    window.addEventListener("storage", sync);
    window.addEventListener("gratehcare:plans-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gratehcare:plans-updated", sync);
    };
  }, []);

  const updatePlan = useCallback((planId: PlanId, override: PlanPriceOverride) => {
    setPlans(savePlanOverride(planId, override));
  }, []);

  const resetPlans = useCallback(() => {
    setPlans(resetPlanOverrides());
  }, []);

  return useMemo(
    () => ({
      plans,
      defaultPlans: PLAN_LIST,
      overrides: readPlanOverrides(),
      updatePlan,
      resetPlans,
    }),
    [plans, updatePlan, resetPlans],
  );
}
