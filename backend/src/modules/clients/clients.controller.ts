import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { ClientsService } from "./clients.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("clients")
export class ClientsController extends TenantCrudController {
  constructor(service: ClientsService) {
    super(service);
  }
}
