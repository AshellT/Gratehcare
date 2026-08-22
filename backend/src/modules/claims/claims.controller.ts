import { Body, Controller, Param, Patch, UseGuards } from "@nestjs/common";
import { ClaimStatus } from "@prisma/client";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { ClaimsService } from "./claims.service";
import { SetClaimStatusDto } from "./dto/set-claim-status.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("claims")
export class ClaimsController extends TenantCrudController {
  constructor(private readonly claimsService: ClaimsService) {
    super(claimsService);
  }

  @Patch(":id/status")
  @Permissions("edit")
  setStatus(
    @Param("id") id: string,
    @Body() dto: SetClaimStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.claimsService.setStatus(id, dto.status as ClaimStatus, user);
  }
}
