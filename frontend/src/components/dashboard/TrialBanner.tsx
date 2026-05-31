import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import React from "react";
import { useSubscriptionContext } from "@/context/SubscriptionContext";

const TrialBanner: React.FC = () => {
  const { isTrialActive, isTrialExpired, isReadOnly, daysLeftInTrial } =
    useSubscriptionContext();

  if (isTrialExpired || (isReadOnly && !isTrialActive)) {
    return (
      <div
        data-testid="trial-expired-banner"
        className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-900">Your 14-day trial has ended</p>
            <p className="mt-0.5 text-sm text-rose-700">
              You can still view your workspace, but creating and editing is paused until you
              upgrade.
            </p>
          </div>
        </div>
        <Link
          to="/app/subscription"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
        >
          Upgrade plan
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (isTrialActive && daysLeftInTrial !== null) {
    return (
      <div
        data-testid="trial-active-banner"
        className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              {daysLeftInTrial === 0
                ? "Your trial ends today"
                : `Trial ends in ${daysLeftInTrial} day${daysLeftInTrial === 1 ? "" : "s"}`}
            </p>
            <p className="mt-0.5 text-sm text-amber-700">
              Add a payment method before the trial ends to keep full access.
            </p>
          </div>
        </div>
        <Link
          to="/app/subscription"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
        >
          View plans
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
