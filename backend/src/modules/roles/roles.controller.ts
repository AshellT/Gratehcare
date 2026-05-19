import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { AssignRoleDto } from "./dto/assign-role.dto";
import { RolesService } from "./roles.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get("permissions")
  @Permissions("view")
  permissions() {
    return this.service.listPermissions();
  }

  @Post("assign")
  @Permissions("manage")
  assign(@Body() dto: AssignRoleDto, @CurrentUser() user: AuthUser) {
    return this.service.assign(dto, user);
  }
}
