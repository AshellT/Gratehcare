import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { StaffService } from "./staff.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("staff")
export class StaffController extends TenantCrudController {
  constructor(service: StaffService) {
    super(service);
  }
}
