import { IsIn, IsOptional, IsString } from "class-validator";

export class OAuthCompleteDto {
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsIn(["start", "pro", "elite"])
  planId?: string;
}
