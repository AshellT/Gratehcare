import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";

@Injectable()
export class BillingService extends TenantCrudService {
  constructor(prisma: PrismaService) {
    super(prisma, "invoice", {
      createData: (dto, tenantId) => ({ tenantId, clientId: dto.metadata?.clientId as string | undefined, number: dto.title, amount: dto.metadata?.amount || 0, status: "DRAFT" }),
      updateData: (dto) => ({ number: dto.title }),
      archiveData: { status: "VOID" },
    });
  }
}
