import { SubscriptionsService } from "../src/modules/subscriptions/subscriptions.service";

const service = new SubscriptionsService();

const active = service.resolveSubscription({
  planId: "pro",
  subscriptionStatus: "trial",
  trialEndsAt: new Date(Date.now() + 5 * 86_400_000),
});

const expired = service.resolveSubscription({
  planId: "start",
  subscriptionStatus: "trial",
  trialEndsAt: new Date(Date.now() - 86_400_000),
});

if (!active.isTrialActive || active.isReadOnly) {
  throw new Error("Active trial should remain writable");
}

if (!expired.isTrialExpired || !expired.isReadOnly) {
  throw new Error("Expired trial should be read-only");
}

if (!service.canBypassSubscription(["PLATFORM_OWNER"])) {
  throw new Error("Platform owner should bypass subscription guard");
}

console.log("Subscription verification passed");
