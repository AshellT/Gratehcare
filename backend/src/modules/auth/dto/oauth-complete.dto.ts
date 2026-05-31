import { IsOptional, IsString } from "class-validator";

export class OAuthCompleteDto {
  @IsOptional()
  @IsString()
  organizationName?: string;
}
