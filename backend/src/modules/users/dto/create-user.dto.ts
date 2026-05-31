import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
