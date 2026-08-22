import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { AuthUser } from "@/common/types/auth-user.type";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AiInsightsService, InsightCategory } from "./ai-insights.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("ai-insights")
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Get()
  @Permissions("view")
  getSummary(
    @CurrentUser() user: AuthUser,
    @Query("categories") categoriesRaw?: string,
  ) {
    const categories = categoriesRaw
      ? (categoriesRaw.split(",").map((c) => c.trim()) as InsightCategory[])
      : undefined;
    return this.aiInsightsService.getSummary(user, categories);
  }

  @Get("critical")
  @Permissions("view")
  getCritical(@CurrentUser() user: AuthUser) {
    return this.aiInsightsService.getCritical(user);
  }

  @Get(":category")
  @Permissions("view")
  getByCategory(
    @CurrentUser() user: AuthUser,
    @Param("category") category: InsightCategory,
  ) {
    return this.aiInsightsService.getByCategory(user, category);
  }
}
