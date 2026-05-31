import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { CreateTenantRecordDto } from "@/common/dto/tenant-record.dto";
import { AuthUser } from "@/common/types/auth-user.type";

@Injectable()
export class CareNotesService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "careNote", {
      createData: (dto, tenantId) => ({
        tenantId,
        clientId: String(dto.metadata?.clientId || ""),
        staffId: (dto.metadata?.staffId as string) || undefined,
        title: dto.title,
        body: dto.description || "",
        status: dto.status || "ACTIVE",
      }),
      updateData: (dto) => ({ title: dto.title, body: dto.description, status: dto.status }),
      defaultOrderBy: { createdAt: "desc" },
    });
  }

  override async create(dto: CreateTenantRecordDto, user: AuthUser) {
    const tenantId = user.tenantId || dto.tenantId;
    if (!tenantId) throw new BadRequestException("Tenant required");

    let clientId = dto.metadata?.clientId as string | undefined;
    if (!clientId && dto.metadata?.clientName) {
      const byName = await this.prisma.client.findFirst({
        where: {
          tenantId,
          fullName: { contains: String(dto.metadata.clientName), mode: "insensitive" },
        },
      });
      clientId = byName?.id;
    }
    if (!clientId) {
      const fallback = await this.prisma.client.findFirst({ where: { tenantId } });
      clientId = fallback?.id;
    }
    if (!clientId) throw new BadRequestException("Client required for care note");

    return super.create(
      {
        ...dto,
        metadata: { ...dto.metadata, clientId },
      },
      user,
    );
  }
}
