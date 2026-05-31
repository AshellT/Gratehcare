import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { ClaimsService } from "./claims.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("claims")
export class ClaimsController extends TenantCrudController {
  constructor(service: ClaimsService) {
    super(service);
  }
}
