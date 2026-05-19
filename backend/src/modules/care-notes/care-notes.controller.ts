import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { CareNotesService } from "./care-notes.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("care-notes")
export class CareNotesController extends TenantCrudController {
  constructor(service: CareNotesService) {
    super(service);
  }
}
