-- AlterTable
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'AUD';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" TEXT;
