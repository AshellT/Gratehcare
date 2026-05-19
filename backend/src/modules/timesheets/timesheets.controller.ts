import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { TimesheetsService } from "./timesheets.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("timesheets")
export class TimesheetsController extends TenantCrudController {
  constructor(service: TimesheetsService) {
    super(service);
  }
}
