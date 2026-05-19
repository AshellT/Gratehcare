import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { OrganizationsService } from "./organizations.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @Permissions("view")
  list(@Query() query: PaginationDto) {
    return this.service.list(query);
  }

  @Get(":id")
  @Permissions("view")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post()
  @Permissions("manage")
  create(@Body() dto: CreateTenantDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }
}
