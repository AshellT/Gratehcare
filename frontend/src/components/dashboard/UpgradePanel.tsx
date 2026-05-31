import React from "react";

import { Link } from "react-router-dom";

import { ArrowRight, CheckCircle2, CreditCard, Loader2, Mail } from "lucide-react";

import Card from "@/components/dashboard/Card";

import type { Plan, PlanId } from "@/lib/plans";

import { buildDemoPath } from "@/lib/signupPlan";



type UpgradePanelProps = {

  plan: Plan;

  planId: PlanId;

  isReadOnly: boolean;

  isTrialActive: boolean;

  daysLeftInTrial: number | null;

  stripeEnabled: boolean;

  onCheckout: (planId: PlanId) => Promise<void>;

  onRequestUpgrade: () => Promise<void>;

  checkingOut: boolean;

  requesting: boolean;

  requested: boolean;

};



const UpgradePanel: React.FC<UpgradePanelProps> = ({

  plan,

  planId,

  isReadOnly,

  isTrialActive,

  daysLeftInTrial,

  stripeEnabled,

  onCheckout,

  onRequestUpgrade,

  checkingOut,

  requesting,

  requested,

}) => {

  const primaryLabel = stripeEnabled

    ? isReadOnly

      ? "Subscribe with card"

      : "Add payment method"

    : "Request upgrade";



  return (

    <Card

      title={isReadOnly ? "Upgrade to restore full access" : "Keep access after your trial"}

      description={

        isReadOnly

          ? "Your trial has ended. Subscribe to continue editing your workspace."

          : isTrialActive && daysLeftInTrial !== null

            ? `You have ${daysLeftInTrial} day${daysLeftInTrial === 1 ? "" : "s"} left on ${plan.name}.`

            : `You're on ${plan.name}. Add billing when you're ready to continue after the trial.`

      }

    >

      <div className="space-y-4">

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">

          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">

            Selected plan

          </div>

          <div className="mt-2 font-display text-xl font-bold text-slate-900">{plan.name}</div>

          <div className="mt-1 text-sm text-slate-600">{plan.tagline}</div>

          <div className="mt-3 text-2xl font-bold text-slate-900">

            ${plan.monthlyPrice}

            <span className="text-sm font-medium text-slate-500"> / mo after trial</span>

          </div>

        </div>



        {requested && !stripeEnabled && (

          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />

            <span>Upgrade request sent. We&apos;ll email you within one business day.</span>

          </div>

        )}



        <div className="flex flex-col gap-3 sm:flex-row">

          <button

            type="button"

            disabled={checkingOut || requesting}

            onClick={() =>

              void (stripeEnabled ? onCheckout(planId) : onRequestUpgrade())

            }

            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"

          >

            {checkingOut || requesting ? (

              <Loader2 className="h-4 w-4 animate-spin" />

            ) : (

              <CreditCard className="h-4 w-4" />

            )}

            {checkingOut ? "Redirecting to Stripe…" : primaryLabel}

          </button>

          <Link

            to={buildDemoPath({ type: "enterprise", plan: plan.id, source: "subscription-page" })}

            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"

          >

            <Mail className="h-4 w-4" />

            Talk to sales

          </Link>

        </div>



        <p className="text-xs text-slate-500">

          {stripeEnabled

            ? "Payments are processed securely by Stripe. Funds are deposited to the GRATEHCARE platform account. You'll receive a confirmation email after checkout."

            : "Card payments aren't configured yet — your request goes to the sales team for manual activation."}

          <ArrowRight className="ml-1 inline h-3 w-3" />

        </p>

      </div>

    </Card>

  );

};



export default UpgradePanel;


