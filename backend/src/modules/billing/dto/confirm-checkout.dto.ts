import { IsString, MinLength } from "class-validator";

export class ConfirmCheckoutDto {
  @IsString()
  @MinLength(8)
  sessionId!: string;
}
