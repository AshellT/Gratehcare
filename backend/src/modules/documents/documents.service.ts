import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";

@Injectable()
export class DocumentsService extends TenantCrudService {
  constructor(prisma: PrismaService) {
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

  /**
   * Handle a multipart upload.  In production, replace the stub storage key
   * with a real object-store (S3, GCS, Supabase Storage, Azure Blob) upload.
   */
  async handleUpload(file: Express.Multer.File, tenantId: string) {
    const storageKey = `tenants/${tenantId}/documents/${randomUUID()}-${file.originalname}`;

    // ── TODO: upload file.buffer to your object store here ──────────────────
    // e.g. await s3.putObject({ Bucket, Key: storageKey, Body: file.buffer });
    // ────────────────────────────────────────────────────────────────────────

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
      // Stub presigned URL – replace with real signed URL from your object store
      previewUrl: `/api/v1/documents/${record.id}/preview`,
    };
  }

  /**
   * Return a presigned URL for previewing/downloading the document.
   * In production, generate a time-limited signed URL from your object store.
   */
  async getPreviewUrl(id: string, tenantId: string) {
    const doc = await this.prisma["document"].findFirst({
      where: { id, tenantId },
    });
    if (!doc) throw new NotFoundException("Document not found");

    // ── TODO: generate real presigned URL ────────────────────────────────────
    // e.g. return s3.getSignedUrl("getObject", { Bucket, Key: doc.storageKey, Expires: 300 });
    // ────────────────────────────────────────────────────────────────────────
    return {
      id: doc.id,
      title: doc.title,
      mimeType: doc.mimeType,
      // Stub – in production return a real signed URL
      url: `https://storage.example.com/${doc.storageKey}?token=stub`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  private resolveDocType(mimeType: string): string {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("word")) return "word";
    return "general";
  }
}
