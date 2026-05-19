import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { AuthUser } from "@/common/types/auth-user.type";
import {
  Controller,
  Get,
  MessageEvent,
  Res,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { NotificationsService } from "./notifications.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("notifications")
export class NotificationsController extends TenantCrudController {
  constructor(private readonly notifService: NotificationsService) {
    super(notifService);
  }

  /**
   * SSE endpoint – clients connect once and receive live notification events.
   * GET /api/v1/notifications/stream
   */
  @UseGuards(JwtAuthGuard)
  @Sse("stream")
  stream(
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ): Observable<MessageEvent> {
    // Keep the connection alive for as long as the client holds it.
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    const tenantId = user.tenantId ?? "";
    return this.notifService
      .streamForTenant(tenantId)
      .pipe(map((event) => ({ data: event }) as MessageEvent));
  }

  /**
   * POST /api/v1/notifications/test-push  (dev helper – remove in production)
   * Body: { tenantId, type, title, body, severity }
   */
  @UseGuards(JwtAuthGuard)
  @Get("test-push")
  testPush(@CurrentUser() user: AuthUser) {
    this.notifService.push({
      id: crypto.randomUUID(),
      tenantId: user.tenantId ?? "",
      type: "general",
      title: "Test notification",
      body: "Real-time SSE is working correctly.",
      severity: "success",
    });
    return { ok: true };
  }
}
