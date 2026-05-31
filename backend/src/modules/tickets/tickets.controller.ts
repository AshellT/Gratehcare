import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { TicketsService } from "./tickets.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("tickets")
export class TicketsController extends TenantCrudController {
  constructor(service: TicketsService) {
    super(service);
  }
}
