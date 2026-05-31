import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { IncidentsService } from "./incidents.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("incidents")
export class IncidentsController extends TenantCrudController {
  constructor(private readonly incidentsService: IncidentsService) {
    super(incidentsService);
  }

  @Patch(":id/close")
  @Permissions("edit")
  close(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.incidentsService.close(id, user);
  }
}
