import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
import Stripe from "stripe";

export type PlanId = "start" | "pro" | "elite";

const VALID_PLANS = new Set<PlanId>(["start", "pro", "elite"]);

@Injectable()
export class StripeConfigService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getSecretKey(): Promise<string | null> {
    const fromEnv = this.config.get<string>("STRIPE_SECRET_KEY")?.trim();
    if (fromEnv) return fromEnv;

    const integration = await this.prisma.integration.findFirst({
      where: {
        enabled: true,
        OR: [
          { name: { equals: "Stripe", mode: "insensitive" } },
          { type: { equals: "payment", mode: "insensitive" }, name: { contains: "Stripe", mode: "insensitive" } },
        ],
      },
    });

    const apiKey =
      typeof integration?.config === "object" &&
      integration.config !== null &&
      "apiKey" in integration.config
        ? String((integration.config as Record<string, unknown>).apiKey || "")
        : "";

    return apiKey.trim() || null;
  }

  getWebhookSecret(): string | null {
    const fromEnv = this.config.get<string>("STRIPE_WEBHOOK_SECRET")?.trim();
    if (fromEnv) return fromEnv;

    return null;
  }

  getPublishableKey(): string | null {
    return this.config.get<string>("STRIPE_PUBLISHABLE_KEY")?.trim() || null;
  }

  getFrontendUrl(): string {
    return (
      this.config.get<string>("FRONTEND_URL")?.trim().replace(/\/$/, "") ||
      this.config.get<string>("CORS_ORIGIN")?.split(",")[0]?.trim().replace(/\/$/, "") ||
      "http://localhost:3000"
    );
  }

  getPriceId(planId: PlanId): string | null {
    const map: Record<PlanId, string | undefined> = {
      start: this.config.get<string>("STRIPE_PRICE_START"),
      pro: this.config.get<string>("STRIPE_PRICE_PRO"),
      elite: this.config.get<string>("STRIPE_PRICE_ELITE"),
    };
    const priceId = map[planId]?.trim();
    return priceId || null;
  }

  normalizePlanId(planId?: string): PlanId {
    if (planId && VALID_PLANS.has(planId as PlanId)) return planId as PlanId;
    return "pro";
  }

  async createClient(): Promise<Stripe | null> {
    const secretKey = await this.getSecretKey();
    if (!secretKey) return null;
    return new Stripe(secretKey);
  }

  async isConfigured(): Promise<boolean> {
    const stripe = await this.createClient();
    if (!stripe) return false;
    const hasPrices = ["start", "pro", "elite"].some((p) => this.getPriceId(p as PlanId));
    return hasPrices;
  }

  /** Card collection for care invoices only needs the secret key. */
  async isPaymentsConfigured(): Promise<boolean> {
    return Boolean(await this.getSecretKey());
  }
}
