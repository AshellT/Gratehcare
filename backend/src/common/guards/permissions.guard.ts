import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { PERMISSION_RESOURCE_KEY, PERMISSIONS_KEY, PermissionAction } from "../decorators/permissions.decorator";
import {
  PermissionResource,
  resourceFromRequestPath,
  roleHasPermission,
  selfUserIdFromPath,
} from "../permissions/role-permissions";

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
    const path = String(request.originalUrl || request.url || "");
    const decorated = this.reflector.getAllAndOverride<PermissionResource>(PERMISSION_RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    let resource = decorated || resourceFromRequestPath(path);
    const selfId = selfUserIdFromPath(path);
    if (selfId && request.user?.sub && selfId === request.user.sub) {
      resource = "settings";
    }

    if (!resource) {
      throw new ForbiddenException("This action is not allowed for your role");
    }

    const allowed = required.every((permission) => roleHasPermission(roles, resource!, permission));
    if (!allowed) {
      throw new ForbiddenException("This action is not allowed for your role");
    }
    return true;
  }
}
