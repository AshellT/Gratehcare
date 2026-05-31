import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";

export class CreateLeadDto {
  @IsIn(["demo", "enterprise"])
  type!: "demo" | "enterprise";

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(["start", "pro", "elite"])
  planId?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
