import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateIntegrationDto } from "./dto/create-integration.dto";
import { UpdateIntegrationConfigDto } from "./dto/update-integration-config.dto";
import { IntegrationsService } from "./integrations.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("integrations")
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

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
  create(@Body() dto: CreateIntegrationDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Post(":id/enable")
  @Permissions("manage")
  enable(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.enable(id, user);
  }

  @Post(":id/disable")
  @Permissions("manage")
  disable(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.disable(id, user);
  }

  @Patch(":id/config")
  @Permissions("manage")
  updateConfig(
    @Param("id") id: string,
    @Body() dto: UpdateIntegrationConfigDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateConfig(id, dto, user);
  }

  @Delete(":id")
  @Permissions("manage")
  delete(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.delete(id, user);
  }

  @Get(":id/logs")
  @Permissions("view")
  getLogs(@Param("id") id: string, @Query() query: PaginationDto) {
    return this.service.getLogs(id, query);
  }
}
