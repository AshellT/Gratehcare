import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { CarePlansService } from "./care-plans.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("care-plans")
export class CarePlansController extends TenantCrudController {
  constructor(service: CarePlansService) {
    super(service);
  }
}
