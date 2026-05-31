import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsIn(["start", "pro", "elite"])
  planId?: string;
}
