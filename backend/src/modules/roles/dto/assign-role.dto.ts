import { Role } from "@prisma/client";
import { IsEnum, IsOptional, IsUUID } from "class-validator";

export class AssignRoleDto {
  @IsUUID()
  userId!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
