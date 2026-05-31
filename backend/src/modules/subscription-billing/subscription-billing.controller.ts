import { Body, Controller, Get, Headers, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { SubscriptionBillingService } from "./subscription-billing.service";

@Controller("subscription-billing")
export class SubscriptionBillingController {
  constructor(private readonly service: SubscriptionBillingService) {}

  /** Public — lets the app know if card checkout is available */
  @Get("config")
  getConfig() {
    return this.service.getPublicConfig();
  }

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  createCheckout(@CurrentUser() user: AuthUser, @Body() dto: CreateCheckoutDto) {
    return this.service.createCheckoutSession(user, dto.planId);
  }

  @Post("stripe/webhook")
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from("");
    return this.service.handleWebhook(rawBody, signature);
  }
}
