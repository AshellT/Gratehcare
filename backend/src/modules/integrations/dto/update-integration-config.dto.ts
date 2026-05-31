import { IsNotEmpty, IsObject } from "class-validator";

export class UpdateIntegrationConfigDto {
  @IsObject()
  @IsNotEmpty()
  config!: Record<string, any>;
}
