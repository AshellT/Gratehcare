import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { IncidentsService } from "./incidents.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("incidents")
export class IncidentsController extends TenantCrudController {
  constructor(service: IncidentsService) {
    super(service);
  }
}
