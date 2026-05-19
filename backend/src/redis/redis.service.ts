import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client?: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>("REDIS_URL");
    this.client = url ? new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 }) : undefined;
  }

  get isConfigured() {
    return Boolean(this.client);
  }

  async getClient() {
    if (!this.client) return null;
    if (this.client.status === "wait") await this.client.connect();
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }
}
