import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { PaginationDto } from "@/common/dto/pagination.dto";

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 25;
    const where = { status: "ACTIVE" as const };
    const [items, total] = await Promise.all([
      this.prisma.knowledgeArticle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.knowledgeArticle.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const item = await this.prisma.knowledgeArticle.findFirst({ where: { id, status: "ACTIVE" } });
    if (!item) throw new NotFoundException("Article not found");
    return item;
  }

  async create(body: { title: string; category?: string; body: string; tags?: string[] }) {
    return this.prisma.knowledgeArticle.create({
      data: {
        title: body.title,
        category: body.category || "General",
        body: body.body,
        tags: body.tags || [],
      },
    });
  }

  async update(id: string, body: Partial<{ title: string; category: string; body: string; tags: string[] }>) {
    await this.get(id);
    return this.prisma.knowledgeArticle.update({ where: { id }, data: body });
  }

  async archive(id: string) {
    await this.get(id);
    return this.prisma.knowledgeArticle.update({ where: { id }, data: { status: "ARCHIVED" } });
  }
}
