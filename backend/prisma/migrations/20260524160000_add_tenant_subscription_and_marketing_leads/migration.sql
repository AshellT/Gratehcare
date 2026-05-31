-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "plan_id" TEXT NOT NULL DEFAULT 'pro';
ALTER TABLE "Tenant" ADD COLUMN "subscription_status" TEXT NOT NULL DEFAULT 'trial';
ALTER TABLE "Tenant" ADD COLUMN "trial_ends_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "marketing_leads" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organization" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "plan_id" TEXT,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_leads_type_idx" ON "marketing_leads"("type");
CREATE INDEX "marketing_leads_email_idx" ON "marketing_leads"("email");
