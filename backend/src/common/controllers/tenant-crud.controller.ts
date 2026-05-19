import { Body, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateTenantRecordDto, UpdateTenantRecordDto } from "../dto/tenant-record.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { CurrentUser } from "../decorators/current-user.decorator";
import { Permissions } from "../decorators/permissions.decorator";
import { AuthUser } from "../types/auth-user.type";
import { TenantCrudService } from "../services/tenant-crud.service";

export abstract class TenantCrudController {
  protected constructor(protected readonly service: TenantCrudService) {}

  @Permissions("view")
  @Get()
  list(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.service.list(query, user);
  }

  @Permissions("view")
  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.get(id, user);
  }

  @Permissions("create")
  @Post()
  create(@Body() dto: CreateTenantRecordDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Permissions("edit")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTenantRecordDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user);
  }

  @Permissions("archive")
  @Post(":id/archive")
  archive(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.archive(id, user);
  }
}
