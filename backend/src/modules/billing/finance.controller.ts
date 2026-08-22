import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { BillingService } from "./billing.service";
import { ConfirmCheckoutDto } from "./dto/confirm-checkout.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("finance")
export class FinanceController {
  constructor(private readonly billingService: BillingService) {}

  @Get("overview")
  @Permissions("view")
  overview(@CurrentUser() user: AuthUser) {
    return this.billingService.overview(user);
  }

  @Get("stripe-status")
  @Permissions("view")
  stripeStatus() {
    return this.billingService.stripeStatus();
  }

  @Post("invoices/:id/checkout")
  @Permissions("view")
  checkout(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.billingService.createPaymentCheckout(id, user);
  }

  @Post("confirm-checkout")
  @Permissions("view")
  confirm(@Body() dto: ConfirmCheckoutDto, @CurrentUser() user: AuthUser) {
    return this.billingService.confirmCheckout(dto.sessionId, user);
  }
}
