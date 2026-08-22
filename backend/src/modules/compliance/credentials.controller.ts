import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { ComplianceService } from "./compliance.service";
import { CreateCredentialDto } from "./dto/create-credential.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("credentials")
export class CredentialsController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  @Permissions("view")
  list(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.complianceService.listCredentials(query, user);
  }

  @Post()
  @Permissions("create")
  create(@Body() dto: CreateCredentialDto, @CurrentUser() user: AuthUser) {
    return this.complianceService.createCredential(dto, user);
  }
}
