import { Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { ComplianceService } from "./compliance.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("compliance")
export class ComplianceController extends TenantCrudController {
  constructor(private readonly complianceService: ComplianceService) {
    super(complianceService);
  }

  @Patch(":id/complete")
  @Permissions("edit")
  complete(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.complianceService.complete(id, user);
  }
}
