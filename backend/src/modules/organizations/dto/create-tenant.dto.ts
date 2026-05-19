import { IsOptional, IsString } from "class-validator";

export class CreateTenantDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  region?: string;
}
