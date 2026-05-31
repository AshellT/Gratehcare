import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { AuthUser } from "@/common/types/auth-user.type";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      this.prisma.tenant.count(),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const item = await this.prisma.tenant.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Organization not found");
    return item;
  }

  async create(dto: CreateTenantDto, user: AuthUser) {
    try {
      const item = await this.prisma.tenant.create({ data: dto });
      await this.prisma.auditLog.create({ data: { actorId: user.sub, action: "create", resource: "tenant", resourceId: item.id } });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Organization slug already exists");
      }
      throw error;
    }
  }
}
