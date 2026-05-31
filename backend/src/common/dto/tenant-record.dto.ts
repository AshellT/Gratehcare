import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from "class-validator";
import { RecordStatus, Severity } from "@prisma/client";

export class CreateTenantRecordDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateTenantRecordDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
