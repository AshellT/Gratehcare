import { Module } from "@nestjs/common";
import { SubscriptionBillingModule } from "@/modules/subscription-billing/subscription-billing.module";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { FinanceController } from "./finance.controller";

@Module({
  imports: [SubscriptionBillingModule],
  controllers: [FinanceController, BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
