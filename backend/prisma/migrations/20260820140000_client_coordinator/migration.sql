-- AlterTable
ALTER TABLE "clients" ADD COLUMN "coordinator_user_id" UUID;

-- CreateIndex
CREATE INDEX "clients_coordinator_user_id_idx" ON "clients"("coordinator_user_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_coordinator_user_id_fkey" FOREIGN KEY ("coordinator_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
