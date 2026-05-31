import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { SystemService } from "./system.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("system")
export class SystemController {
  constructor(private readonly service: SystemService) {}

  @Get("health")
  @Permissions("view")
  health() {
    return this.service.getHealth();
  }
}
