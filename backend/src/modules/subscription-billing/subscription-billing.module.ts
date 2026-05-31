import { Module } from "@nestjs/common";
import { SubscriptionBillingController } from "./subscription-billing.controller";
import { SubscriptionBillingService } from "./subscription-billing.service";
import { StripeConfigService } from "./stripe-config.service";
import { BillingEmailService } from "./billing-email.service";

@Module({
  controllers: [SubscriptionBillingController],
  providers: [
    SubscriptionBillingService,
    StripeConfigService,
    BillingEmailService,
  ],
  exports: [StripeConfigService, SubscriptionBillingService],
})
export class SubscriptionBillingModule {}
