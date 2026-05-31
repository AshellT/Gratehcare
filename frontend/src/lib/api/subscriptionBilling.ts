import { apiClient } from "./client";

export type SubscriptionBillingConfig = {
  stripeEnabled: boolean;
  publishableKey: string | null;
  plans: { id: string; priceConfigured: boolean }[];
};

export const subscriptionBillingApi = {
  getConfig: () =>
    apiClient.get<SubscriptionBillingConfig>("/subscription-billing/config", {
      public: true,
    }),

  createCheckout: (planId?: string) =>
    apiClient.post<{ url: string; sessionId: string; planId: string; planName: string }>(
      "/subscription-billing/checkout",
      planId ? { planId } : {},
    ),
};
