import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { MedicationService } from "./medication.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("medication")
export class MedicationController extends TenantCrudController {
  constructor(service: MedicationService) {
    super(service);
  }
}
