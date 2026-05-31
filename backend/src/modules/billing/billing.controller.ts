import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { Permissions } from "@/common/decorators/permissions.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AuthUser } from "@/common/types/auth-user.type";
import { BillingService } from "./billing.service";

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
}
