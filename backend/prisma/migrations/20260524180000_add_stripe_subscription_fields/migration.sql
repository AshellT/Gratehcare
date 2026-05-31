-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "stripe_subscription_id" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "billing_email" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "current_period_end" TIMESTAMP(3);
