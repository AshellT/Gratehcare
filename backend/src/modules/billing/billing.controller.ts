import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { BillingService } from "./billing.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("billing")
export class BillingController extends TenantCrudController {
  constructor(service: BillingService) {
    super(service);
  }
}
