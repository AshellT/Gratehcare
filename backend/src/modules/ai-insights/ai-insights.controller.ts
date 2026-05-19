import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import type { AuthUser } from "@/common/types/auth-user.type";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AiInsightsService, InsightCategory } from "./ai-insights.service";

@UseGuards(JwtAuthGuard)
@Controller("ai-insights")
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  /** GET /api/v1/ai-insights  — full summary, optional ?categories=burnout,client_risk */
  @Get()
  getSummary(
    @CurrentUser() user: AuthUser,
    @Query("categories") categoriesRaw?: string,
  ) {
    const categories = categoriesRaw
      ? (categoriesRaw.split(",").map((c) => c.trim()) as InsightCategory[])
      : undefined;
    return this.aiInsightsService.getSummary(user.tenantId ?? "platform", categories);
  }

  /** GET /api/v1/ai-insights/critical */
  @Get("critical")
  getCritical(@CurrentUser() user: AuthUser) {
    return this.aiInsightsService.getCritical(user.tenantId ?? "platform");
  }

  /** GET /api/v1/ai-insights/:category */
  @Get(":category")
  getByCategory(
    @CurrentUser() user: AuthUser,
    @Param("category") category: InsightCategory,
  ) {
    return this.aiInsightsService.getByCategory(user.tenantId ?? "platform", category);
  }
}
