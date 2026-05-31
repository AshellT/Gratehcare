import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { KnowledgeService } from "./knowledge.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("knowledge")
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

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
  @Permissions("create")
  create(@Body() body: { title: string; category?: string; body: string; tags?: string[] }) {
    return this.service.create(body);
  }

  @Patch(":id")
  @Permissions("edit")
  update(@Param("id") id: string, @Body() body: Partial<{ title: string; category: string; body: string; tags: string[] }>) {
    return this.service.update(id, body);
  }

  @Post(":id/archive")
  @Permissions("archive")
  archive(@Param("id") id: string) {
    return this.service.archive(id);
  }
}
