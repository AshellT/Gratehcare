import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { BillingService } from "./billing.service";
import { ConfirmCheckoutDto } from "./dto/confirm-checkout.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("billing")
export class BillingController extends TenantCrudController {
  constructor(private readonly billingService: BillingService) {
    super(billingService);
  }

  @Patch(":id/mark-paid")
  @Permissions("edit")
  markPaid(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.billingService.markPaid(id, user);
  }

  @Post(":id/send")
  @Permissions("finalize")
  send(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.billingService.sendInvoice(id, user);
  }

  @Post(":id/checkout")
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
