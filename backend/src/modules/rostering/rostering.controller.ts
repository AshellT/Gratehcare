import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { RosteringService } from "./rostering.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("rostering")
export class RosteringController extends TenantCrudController {
  constructor(private readonly rosteringService: RosteringService) {
    super(rosteringService);
  }

  @Patch(":id/assign")
  @Permissions("edit")
  assign(
    @Param("id") id: string,
    @Body() body: { workerId?: string; staffId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.rosteringService.assignWorker(id, body.workerId || body.staffId || "", user);
  }
}

