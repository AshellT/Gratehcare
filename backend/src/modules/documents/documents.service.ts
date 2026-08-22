import { TenantCrudService } from "@/common/services/tenant-crud.service";
import type { AuthUser } from "@/common/types/auth-user.type";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

@Injectable()
export class DocumentsService extends TenantCrudService {
  constructor(
    prisma: PrismaService,
    private readonly appConfig: ConfigService,
  ) {
    super(prisma, "document", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: dto.metadata?.clientId as string | undefined,
        title: dto.title,
        type: String(dto.metadata?.type || "general"),
        storageKey: String(dto.metadata?.storageKey || dto.title),
        status: dto.status || "ACTIVE",
      }),
      updateData: (dto) => ({ title: dto.title, status: dto.status }),
    });
  }

  private uploadRoot() {
    return resolve(
      this.appConfig.get<string>("UPLOAD_DIR")?.trim() || join(process.cwd(), "uploads"),
    );
  }

  private safeFileName(original: string) {
    return original.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180) || "file";
  }

  async handleUpload(file: Express.Multer.File, tenantId: string) {
    const storageKey = `tenants/${tenantId}/documents/${randomUUID()}-${this.safeFileName(file.originalname)}`;
    const absolute = join(this.uploadRoot(), storageKey);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, file.buffer);

    const record = await this.prisma["document"].create({
      data: {
        tenantId,
        title: file.originalname,
        type: this.resolveDocType(file.mimetype),
        storageKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        status: "ACTIVE",
      },
    });

    return {
      ...record,
      previewUrl: `/api/v1/documents/${record.id}/file`,
    };
  }

  async getPreviewUrl(id: string, user: AuthUser) {
    const doc = await this.get(id, user);
    return {
      id: doc.id,
      title: doc.title,
      mimeType: doc.mimeType,
      url: `/api/v1/documents/${doc.id}/file`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async openFile(id: string, user: AuthUser) {
    const doc = await this.get(id, user);
    const absolute = join(this.uploadRoot(), doc.storageKey);
    if (!existsSync(absolute)) {
      throw new ServiceUnavailableException("File is missing from storage");
    }
    return {
      stream: createReadStream(absolute),
      mimeType: doc.mimeType || "application/octet-stream",
      filename: doc.title,
    };
  }

  private resolveDocType(mimeType: string): string {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("word")) return "word";
    return "general";
  }
}
