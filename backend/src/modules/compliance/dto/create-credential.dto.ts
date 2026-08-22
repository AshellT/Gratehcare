import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateCredentialDto {
  @IsUUID()
  staffId!: string;

  @IsString()
  @MinLength(2)
  type!: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
