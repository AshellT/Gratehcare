import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { AuditLogsService } from "./audit-logs.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @Permissions("view")
  list(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.service.list(query, user);
  }
}
