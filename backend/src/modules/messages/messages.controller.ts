import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Permissions("view")
  @Get()
  listConversations(@Query() query: PaginationDto, @CurrentUser() user: AuthUser) {
    return this.service.listConversations(query, user);
  }

  @Permissions("view")
  @Get(":threadId/messages")
  getThreadMessages(
    @Param("threadId") threadId: string,
    @Query() query: PaginationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getThreadMessages(threadId, query, user);
  }

  @Permissions("create")
  @Post(":threadId/messages")
  sendMessage(
    @Param("threadId") threadId: string,
    @Body() body: { content?: string; body?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.sendMessage(threadId, body.content || body.body || "", user);
  }

  @Permissions("edit")
  @Patch(":threadId/read")
  markRead(@Param("threadId") threadId: string, @CurrentUser() user: AuthUser) {
    return this.service.markThreadRead(threadId, user);
  }

  @Permissions("create")
  @Post()
  createThread(@Body() body: { subject?: string; content?: string }, @CurrentUser() user: AuthUser) {
    return this.service.createThread(body.subject || "Conversation", body.content || "", user);
  }
}
