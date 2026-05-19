import { Role } from "@prisma/client";

export type AuthUser = {
  sub: string;
  tenantId?: string | null;
  email: string;
  roles: Role[];
};
