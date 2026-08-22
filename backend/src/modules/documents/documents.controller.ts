import { TenantCrudController } from "@/common/controllers/tenant-crud.controller";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { PermissionsGuard } from "@/common/guards/permissions.guard";
import type { AuthUser } from "@/common/types/auth-user.type";
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DocumentsService } from "./documents.service";
import { Permissions } from "@/common/decorators/permissions.decorator";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("documents")
export class DocumentsController extends TenantCrudController {
  constructor(private readonly docsService: DocumentsService) {
    super(docsService);
  }

  /**
   * POST /api/v1/documents/upload
   */
  @Post("upload")
  @Permissions("create")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
        }
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    if (!file) throw new BadRequestException("No file attached");
    return this.docsService.handleUpload(file, user.tenantId ?? "");
  }

  /**
   * GET /api/v1/documents/:id/preview
   * Returns a presigned download URL for viewing the document.
   */
  @Get(":id/preview")
  @Permissions("view")
  getPreviewUrl(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.docsService.getPreviewUrl(id, user);
  }

  @Get(":id/file")
  @Permissions("view")
  @Header("Cache-Control", "private, max-age=60")
  async getFile(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const file = await this.docsService.openFile(id, user);
    return new StreamableFile(file.stream, {
      type: file.mimeType,
      disposition: `inline; filename="${encodeURIComponent(file.filename)}"`,
    });
  }
}
