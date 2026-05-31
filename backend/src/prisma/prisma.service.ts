import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    this.registerAuditHook();
    try {
      await this.$connect();
    } catch (error) {
      console.error(
        "Prisma failed to connect — API will start but DB routes may fail:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private registerAuditHook() {
    const middleware = (this as any).$use;
    if (!middleware) return;

    middleware.call(this, async (params: any, next: (params: any) => Promise<unknown>) => {
      const result = await next(params);
      const auditable = ["create", "update", "delete", "upsert"].includes(params.action);
      if (auditable && params.model !== "AuditLog") {
        // Production hook point: emit to queue/worker or write audit log with request context.
        // The request context middleware attaches tenant/user metadata for future expansion.
      }
      return result;
    });
  }
}
