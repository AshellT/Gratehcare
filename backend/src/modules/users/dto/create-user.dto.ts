import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateUserDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;
}
