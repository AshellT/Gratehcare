import { SetMetadata } from "@nestjs/common";

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
export const Permissions = (...permissions: PermissionAction[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
