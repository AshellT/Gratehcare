import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { TimesheetsService } from "./timesheets.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("timesheets")
export class TimesheetsController extends TenantCrudController {
  constructor(private readonly timesheetsService: TimesheetsService) {
    super(timesheetsService);
  }

  @Patch(":id/submit")
  @Permissions("edit")
  submit(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.timesheetsService.submit(id, user);
  }

  @Patch(":id/approve")
  @Permissions("approve")
  approve(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.timesheetsService.approve(id, user);
  }

  @Patch(":id/reject")
  @Permissions("approve")
  reject(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.timesheetsService.reject(id, user);
  }
}
