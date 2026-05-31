import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("view")
  list(@Query() query: PaginationDto) {
    return this.service.list(query);
  }

  @Get("current")
  @UseGuards(JwtAuthGuard)
  getCurrent(@CurrentUser() user: AuthUser) {
    return this.service.getCurrent(user);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("view")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions("manage")
  create(@Body() dto: CreateTenantDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }
}
