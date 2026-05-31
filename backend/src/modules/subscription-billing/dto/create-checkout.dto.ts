import { IsIn, IsOptional } from "class-validator";

export class CreateCheckoutDto {
  @IsOptional()
  @IsIn(["start", "pro", "elite"])
  planId?: "start" | "pro" | "elite";
}
