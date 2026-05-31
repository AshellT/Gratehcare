import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    this.registerAuditHook();
    // Do not block HTTP startup on a slow/unreachable database (Railway healthcheck).
    void this.connectWithTimeout();
  }

  private async connectWithTimeout() {
    const timeoutMs = 8_000;
    try {
      await Promise.race([
        this.$connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs),
        ),
      ]);
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
