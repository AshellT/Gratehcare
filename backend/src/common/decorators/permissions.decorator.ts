import { SetMetadata } from "@nestjs/common";
import type { PermissionResource } from "../permissions/role-permissions";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "archive"
  | "approve"
  | "finalize"
  | "manage"
  | "export";

export const PERMISSIONS_KEY = "permissions";
export const PERMISSION_RESOURCE_KEY = "permission_resource";

export const Permissions = (...permissions: PermissionAction[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireResource = (resource: PermissionResource) =>
  SetMetadata(PERMISSION_RESOURCE_KEY, resource);
