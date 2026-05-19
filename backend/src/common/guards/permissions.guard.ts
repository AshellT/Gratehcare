import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { PERMISSIONS_KEY, PermissionAction } from "../decorators/permissions.decorator";

const rolePermissions: Record<Role, PermissionAction[]> = {
  PLATFORM_OWNER: ["view", "create", "edit", "delete", "archive", "approve", "finalize", "manage", "export"],
  SUPER_ADMIN: ["view", "create", "edit", "delete", "archive", "approve", "finalize", "manage", "export"],
  PLATFORM_SUPPORT: ["view", "create", "edit", "export"],
  ORGANIZATION_OWNER: ["view", "create", "edit", "archive", "approve", "finalize", "manage", "export"],
  OPERATIONS_ADMIN: ["view", "create", "edit", "archive", "approve", "export"],
  CARE_COORDINATOR: ["view", "create", "edit", "export"],
  SUPPORT_WORKER: ["view", "create", "edit"],
  BILLING_OFFICER: ["view", "create", "edit", "archive", "approve", "finalize", "manage", "export"],
  COMPLIANCE_OFFICER: ["view", "create", "edit", "archive", "approve", "finalize", "manage", "export"],
  FAMILY_USER: ["view"],
  PRACTITIONER: ["view", "create", "edit", "export"],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<PermissionAction[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest();
    const roles = (request.user?.roles || []) as Role[];
    return roles.some((role) =>
      required.every((permission) => rolePermissions[role]?.includes(permission) || rolePermissions[role]?.includes("manage")),
    );
  }
}
