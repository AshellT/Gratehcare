import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { RosteringService } from "./rostering.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("rostering")
export class RosteringController extends TenantCrudController {
  constructor(service: RosteringService) {
    super(service);
  }
}
