import { IsOptional, IsString } from "class-validator";

export class UpgradeRequestDto {
  @IsOptional()
  @IsString()
  message?: string;
}
