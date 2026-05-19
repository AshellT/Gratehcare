import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Permissions("view")
  list(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.service.list(query, user);
  }

  @Get(":id")
  @Permissions("view")
  get(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.get(id, user);
  }

  @Post()
  @Permissions("create")
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Patch(":id")
  @Permissions("edit")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user);
  }

  @Post(":id/archive")
  @Permissions("archive")
  archive(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.service.archive(id, user);
  }
}
