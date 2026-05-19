import { Controller, UseGuards } from "@nestjs/common";
import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("messages")
export class MessagesController extends TenantCrudController {
  constructor(service: MessagesService) {
    super(service);
  }
}
