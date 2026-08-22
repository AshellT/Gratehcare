import { IsIn, IsString } from "class-validator";

export const CLAIM_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "REVIEW",
  "APPROVED",
  "PAID",
  "REJECTED",
] as const;

export class SetClaimStatusDto {
  @IsString()
  @IsIn(CLAIM_STATUSES)
  status!: (typeof CLAIM_STATUSES)[number];
}
