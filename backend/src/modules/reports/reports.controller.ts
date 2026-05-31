import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { ReportsService } from "./reports.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("reports")
export class ReportsController extends TenantCrudController {
  constructor(private readonly reportsService: ReportsService) {
    super(reportsService);
  }

  @Post("generate")
  @Permissions("create")
  generate(@Body() body: { title?: string; type?: string; metadata?: Record<string, unknown> }, @CurrentUser() user: AuthUser) {
    return this.reportsService.generate(body, user);
  }

  @Get(":id/download")
  @Permissions("view")
  download(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.download(id, user);
  }
}
