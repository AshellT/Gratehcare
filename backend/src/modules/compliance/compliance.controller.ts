import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { ComplianceService } from "./compliance.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance")
export class ComplianceController extends TenantCrudController {
  constructor(service: ComplianceService) {
    super(service);
  }
}
