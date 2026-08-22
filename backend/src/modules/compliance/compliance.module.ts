import { Module } from "@nestjs/common";
import { ComplianceController } from "./compliance.controller";
import { ComplianceService } from "./compliance.service";
import { CredentialsController } from "./credentials.controller";

@Module({
  controllers: [CredentialsController, ComplianceController],
  providers: [ComplianceService],
})
export class ComplianceModule {}
