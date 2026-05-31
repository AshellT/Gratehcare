import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import UpgradePanel from "@/components/dashboard/UpgradePanel";
import { useAuth } from "@/context/AuthContext";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionBillingApi } from "@/lib/api/subscriptionBilling";
import { tenantsApi } from "@/lib/api/tenants";
import {
  PLAN_FEATURES,
  type BillingCycle,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  HardDrive,
  Receipt,
  RotateCcw,
  Save,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ─── Usage bar ────────────────────────────────────────────────────────────────

const UsageBar: React.FC<{
  label: string;
  used: number | string;
  total: number | string;
  pct: number;
  icon: React.ReactNode;
  warn?: boolean;
}> = ({ label, used, total, pct, icon, warn }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        {icon}
        {label}
      </div>
      <span
        className={`text-xs font-bold ${warn ? "text-amber-600" : "text-slate-500"}`}
      >
        {used} / {total}
        {warn && <AlertTriangle className="inline ml-1 h-3.5 w-3.5" />}
      </span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full ${
          pct >= 90
            ? "bg-rose-500"
            : pct >= 75
              ? "bg-amber-400"
              : "bg-indigo-500"
        }`}
      />
    </div>
    <div className="mt-1 text-xs text-slate-400">{pct}% used</div>
  </div>
);

// ─── Plan option card (for upgrade/change) ────────────────────────────────────

interface PlanOptionProps {
  plan: Plan;
  plans: Plan[];
  currentPlanId: PlanId;
  cycle: BillingCycle;
  onSelect: (id: PlanId) => void;
}

const PlanOption: React.FC<PlanOptionProps> = ({
  plan,
  plans,
  currentPlanId,
  cycle,
  onSelect,
}) => {
  const isCurrent = plan.id === currentPlanId;
  const price = cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

  const direction: "current" | "upgrade" | "downgrade" = isCurrent
    ? "current"
    : plans.findIndex((p) => p.id === plan.id) >
        plans.findIndex((p) => p.id === currentPlanId)
      ? "upgrade"
      : "downgrade";

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        isCurrent
          ? "border-indigo-400 bg-indigo-50"
          : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
      }`}
      onClick={() => !isCurrent && onSelect(plan.id)}
    >
      <div className="flex items-center justify-between">
        <div>
          <div
            className={`text-xs font-bold uppercase tracking-widest ${plan.accentText}`}
          >
            {plan.name}
          </div>
          <div className="mt-0.5 font-display text-lg font-bold text-slate-900">
            ${price}
            <span className="text-sm font-medium text-slate-500">/mo</span>
          </div>
        </div>
        {isCurrent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
            <Check className="h-3.5 w-3.5" /> Current plan
          </span>
        ) : (
          <button
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              direction === "upgrade"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {direction === "upgrade" ? (
              <>
                <TrendingUp className="h-3.5 w-3.5" /> Upgrade
              </>
            ) : (
              <>Downgrade</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Billing history stub ─────────────────────────────────────────────────────

const BILLING_HISTORY = [
  {
    id: "INV-S0028",
    date: "2026-04-28",
    amount: 199,
    status: "paid",
    desc: "GRATEHCARE Pro · Monthly",
  },
  {
    id: "INV-S0027",
    date: "2026-03-28",
    amount: 199,
    status: "paid",
    desc: "GRATEHCARE Pro · Monthly",
  },
  {
    id: "INV-S0026",
    date: "2026-02-28",
    amount: 199,
    status: "paid",
    desc: "GRATEHCARE Pro · Monthly",
  },
  {
    id: "INV-S0025",
    date: "2026-01-28",
    amount: 199,
    status: "paid",
    desc: "GRATEHCARE Pro · Monthly",
  },
  {
    id: "INV-S0024",
    date: "2025-12-28",
    amount: 199,
    status: "paid",
    desc: "GRATEHCARE Pro · Monthly",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type PlanDraft = Record<
  PlanId,
  {
    name: string;
    monthlyPrice: string;
    annualPrice: string;
    staff: string;
    clients: string;
    storage: string;
    tagline: string;
  }
>;

const toDraft = (plans: Plan[]): PlanDraft =>
  Object.fromEntries(
    plans.map((plan) => [
      plan.id,
      {
        name: plan.name,
        monthlyPrice: String(plan.monthlyPrice),
        annualPrice: String(plan.annualPrice),
        staff: String(plan.limits.staff),
        clients: String(plan.limits.clients),
        storage: plan.limits.storage,
        tagline: plan.tagline,
      },
    ]),
  ) as PlanDraft;

const parseLimit = (value: string): number | "unlimited" => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "unlimited") return "unlimited";
  const parsed = Number(normalized.replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : "unlimited";
};

const PlanAdminEditor: React.FC<{
  plans: Plan[];
  onSave: (planId: PlanId, draft: PlanDraft[PlanId]) => void;
  onReset: () => void;
}> = ({ plans, onSave, onReset }) => {
  const [draft, setDraft] = useState<PlanDraft>(() => toDraft(plans));

  React.useEffect(() => {
    setDraft(toDraft(plans));
  }, [plans]);

  const update = (
    planId: PlanId,
    key: keyof PlanDraft[PlanId],
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      [planId]: { ...current[planId], [key]: value },
    }));
  };

  return (
    <Card
      title="System plan editor"
      description="System admins control public plan names, prices and usage limits shown on the landing page."
      action={
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset defaults
        </button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const item = draft[plan.id];
          const monthly = Number(item.monthlyPrice);
          const annual = Number(item.annualPrice);
          const hasPriceError =
            !Number.isFinite(monthly) ||
            monthly <= 0 ||
            !Number.isFinite(annual) ||
            annual <= 0;

          return (
            <div
              key={plan.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`text-xs font-bold uppercase tracking-widest ${plan.accentText}`}
                >
                  {plan.name}
                </div>
                {plan.popular && <Badge tone="indigo">Most popular</Badge>}
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">
                    Plan name
                  </span>
                  <input
                    value={item.name}
                    onChange={(e) => update(plan.id, "name", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500">
                    Tagline
                  </span>
                  <textarea
                    value={item.tagline}
                    onChange={(e) =>
                      update(plan.id, "tagline", e.target.value)
                    }
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">
                      Monthly $
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.monthlyPrice}
                      onChange={(e) =>
                        update(plan.id, "monthlyPrice", e.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">
                      Annual $/mo
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.annualPrice}
                      onChange={(e) =>
                        update(plan.id, "annualPrice", e.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">
                      Staff
                    </span>
                    <input
                      value={item.staff}
                      onChange={(e) => update(plan.id, "staff", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">
                      Clients
                    </span>
                    <input
                      value={item.clients}
                      onChange={(e) =>
                        update(plan.id, "clients", e.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500">
                      Storage
                    </span>
                    <input
                      value={item.storage}
                      onChange={(e) =>
                        update(plan.id, "storage", e.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
                    />
                  </label>
                </div>
                {hasPriceError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                    Enter valid monthly and annual prices before saving.
                  </div>
                )}
                <button
                  disabled={hasPriceError}
                  onClick={() => onSave(plan.id, item)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save className="h-4 w-4" /> Save {plan.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { plans, updatePlan, resetPlans } = usePlanCatalog();
  const sub = useSubscription();
  const [toast, setToast] = useState<string | null>(null);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [upgradeRequesting, setUpgradeRequesting] = useState(false);
  const [upgradeRequested, setUpgradeRequested] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const canEditSystemPlans =
    user?.role === "super_admin" || user?.role === "platform_owner";

  useEffect(() => {
    subscriptionBillingApi
      .getConfig()
      .then((config) => setStripeEnabled(config.stripeEnabled))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      notify("Payment setup complete — refreshing your subscription…");
      void sub.refresh?.();
      setSearchParams({}, { replace: true });
    } else if (checkout === "cancel") {
      notify("Checkout cancelled. You can try again anytime.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const handleUpgradeRequest = async () => {
    setUpgradeRequesting(true);
    try {
      const res = await tenantsApi.requestUpgrade(
        `Upgrade request from ${user?.organization || "organization"} on ${sub.plan.name}.`,
      );
      setUpgradeRequested(true);
      notify(res.message);
    } catch (err: any) {
      notify(err?.message || "Could not send upgrade request.");
    } finally {
      setUpgradeRequesting(false);
    }
  };

  const handleCheckout = async (planId: PlanId) => {
    setCheckingOut(true);
    try {
      const session = await subscriptionBillingApi.createCheckout(planId);
      window.location.href = session.url;
    } catch (err: any) {
      notify(err?.message || "Could not start Stripe checkout.");
      setCheckingOut(false);
    }
  };

  const handlePlanSelect = (id: PlanId) => {
    if (sub.isReadOnly) {
      notify("Upgrade your plan before changing subscription settings.");
      return;
    }
    const target = plans.find((p) => p.id === id)!;
    const direction =
      plans.findIndex((p) => p.id === id) >
      plans.findIndex((p) => p.id === sub.planId)
        ? "upgrade"
        : "downgrade";
    notify(
      direction === "upgrade"
        ? `Upgrading to ${target.name} — prorated charge will be applied immediately.`
        : `Downgrade to ${target.name} will take effect at end of billing period (${sub.currentPeriodEnd}).`,
    );
    setChangePlanOpen(false);
  };

  const saveSystemPlan = (planId: PlanId, draft: PlanDraft[PlanId]) => {
    updatePlan(planId, {
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      monthlyPrice: Number(draft.monthlyPrice),
      annualPrice: Number(draft.annualPrice),
      limits: {
        staff: parseLimit(draft.staff),
        clients: parseLimit(draft.clients),
        storage: draft.storage.trim() || "Unlimited",
      },
    });
    notify(`${draft.name} updated across landing page and app plans.`);
  };

  const statusTone: Record<string, "emerald" | "amber" | "rose" | "indigo"> = {
    active: "emerald",
    trial: "amber",
    past_due: "rose",
    cancelled: "rose",
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        eyebrow="Subscription"
        title="Plan & billing"
        description="Manage your GRATEHCARE subscription, usage limits and billing history."
        actions={[
          {
            label: "View all plans",
            onClick: () => navigate("/pricing"),
            variant: "secondary",
          },
        ]}
      />

      {canEditSystemPlans && (
        <PlanAdminEditor
          plans={plans}
          onSave={saveSystemPlan}
          onReset={() => {
            resetPlans();
            notify("Plan defaults restored across landing page and app plans.");
          }}
        />
      )}

      <UpgradePanel
        plan={sub.plan}
        planId={sub.planId}
        isReadOnly={sub.isReadOnly}
        isTrialActive={sub.isTrialActive}
        daysLeftInTrial={sub.daysLeftInTrial}
        stripeEnabled={stripeEnabled}
        onCheckout={handleCheckout}
        onRequestUpgrade={handleUpgradeRequest}
        checkingOut={checkingOut}
        requesting={upgradeRequesting}
        requested={upgradeRequested}
      />

      {sub.status === "past_due" && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
          <div className="flex-1">
            <span className="text-sm font-bold text-rose-800">
              Payment overdue
            </span>
            <span className="ml-2 text-sm text-rose-700">
              — your subscription will be paused unless payment is updated.
            </span>
          </div>
          <button
            onClick={() => notify("Payment update modal opened.")}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            Update payment
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Current plan"
          value={sub.plan.name}
          icon={<Star className="h-5 w-5" />}
          tone="indigo"
          index={0}
        />
        <StatCard
          label="Billing cycle"
          value={sub.cycle === "monthly" ? "Monthly" : "Annual"}
          icon={<Calendar className="h-5 w-5" />}
          tone="sky"
          index={1}
        />
        <StatCard
          label="Next billing"
          value={sub.currentPeriodEnd}
          hint={`In ${sub.daysLeftInPeriod} days`}
          icon={<CreditCard className="h-5 w-5" />}
          tone="slate"
          index={2}
        />
        <StatCard
          label="Status"
          value={sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
          icon={<Zap className="h-5 w-5" />}
          tone={statusTone[sub.status] ?? "slate"}
          index={3}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current plan card */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Current plan"
            description={`You are on ${sub.plan.name} · billed ${sub.cycle}.`}
            action={
              <Badge tone={statusTone[sub.status] ?? "slate"} dot>
                {sub.status}
              </Badge>
            }
          >
            {/* Plan header */}
            <div
              className={`rounded-xl bg-gradient-to-br ${sub.plan.color} p-5 text-white mb-5`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-75">
                    {sub.plan.name}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    $
                    {sub.cycle === "monthly"
                      ? sub.plan.monthlyPrice
                      : sub.plan.annualPrice}
                    <span className="ml-1 text-sm font-medium opacity-80">
                      / month
                    </span>
                  </div>
                  <div className="mt-1 text-sm opacity-80">
                    {sub.plan.tagline}
                  </div>
                </div>
                {sub.plan.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                    <Star className="h-3 w-3 fill-white" /> Most popular
                  </span>
                )}
              </div>
            </div>

            {/* Usage meters */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Usage this period
              </h4>
              <UsageBar
                label="Staff seats"
                used={sub.seats.used}
                total={
                  sub.plan.limits.staff === "unlimited"
                    ? "Unlimited"
                    : sub.plan.limits.staff
                }
                pct={sub.staffPct}
                icon={<Users className="h-4 w-4 text-slate-400" />}
                warn={sub.staffPct >= 80}
              />
              <UsageBar
                label="Storage"
                used={`${sub.storageGb.used} GB`}
                total={sub.plan.limits.storage}
                pct={sub.storagePct}
                icon={<HardDrive className="h-4 w-4 text-slate-400" />}
                warn={sub.storagePct >= 80}
              />
            </div>

            {/* Change plan */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => !sub.isReadOnly && setChangePlanOpen((v) => !v)}
                disabled={sub.isReadOnly}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrendingUp className="h-4 w-4" />
                Change plan
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${changePlanOpen ? "rotate-90" : ""}`}
                />
              </button>
              <button
                onClick={() =>
                  notify("Annual billing switch confirmed. 17% saved.")
                }
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {sub.cycle === "monthly"
                  ? "Switch to annual (save 17%)"
                  : "Switch to monthly"}
              </button>
            </div>

            {/* Plan selector (expandable) */}
            <AnimatePresence>
              {changePlanOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Select a plan
                    </h4>
                    {plans.map((p) => (
                      <PlanOption
                        key={p.id}
                        plan={p}
                        plans={plans}
                        currentPlanId={sub.planId}
                        cycle={sub.cycle}
                        onSelect={handlePlanSelect}
                      />
                    ))}
                    <p className="text-xs text-slate-500 pt-1">
                      Upgrades take effect immediately. Downgrades apply at the
                      end of your billing period.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Feature highlight for current plan */}
          <Card
            title="What's included in your plan"
            description={`Highlights for ${sub.plan.name}.`}
          >
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {PLAN_FEATURES.filter(
                (f) => f.highlight && f[sub.planId] !== false,
              ).map((f) => (
                <div
                  key={f.key}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span>
                    {f.label}
                    {typeof f[sub.planId] === "string" && (
                      <span className="ml-1 text-slate-500">
                        ({f[sub.planId]})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate("/pricing")}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Compare all plan features <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Payment method */}
          <Card
            title="Payment method"
            description="Billing details on file."
            action={
              <button
                onClick={() => notify("Payment method editor opened.")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </button>
            }
          >
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
              <div className="h-10 w-16 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Visa •••• 4242
                </div>
                <div className="text-xs text-slate-500">Expires 09 / 2028</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">Billing email</div>
              <div className="text-sm font-semibold text-slate-900">
                billing@meridian.care
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">Next charge</div>
              <div className="text-sm font-bold text-slate-900">
                ${sub.plan.monthlyPrice}.00 AUD on {sub.currentPeriodEnd}
              </div>
            </div>
          </Card>

          {/* Billing history */}
          <Card
            title="Billing history"
            description="Recent subscription invoices."
            action={
              <button
                onClick={() => notify("Full invoice history downloaded.")}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Receipt className="h-3.5 w-3.5" /> Export
              </button>
            }
          >
            <ul className="space-y-0 divide-y divide-slate-100">
              {BILLING_HISTORY.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {inv.id}
                    </div>
                    <div className="text-xs text-slate-500">
                      {inv.date} · {inv.desc}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      ${inv.amount}
                    </span>
                    <Badge tone="emerald" dot>
                      paid
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Danger zone */}
          <Card title="Danger zone">
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Cancelling will stop billing at the end of your current period.
                Your data is retained for 90 days.
              </p>
              <button
                onClick={() =>
                  notify(
                    "Cancellation request submitted. Our team will reach out within 24 hours.",
                  )
                }
                className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100"
              >
                Cancel subscription
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
