import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { PLANS } from "@/modules/subscription-billing/plan-catalog";
import { BillingEmailService } from "./billing-email.service";
import { StripeConfigService, type PlanId } from "./stripe-config.service";
import Stripe from "stripe";

@Injectable()
export class SubscriptionBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeConfig: StripeConfigService,
    private readonly email: BillingEmailService,
  ) {}

  async getPublicConfig() {
    const configured = await this.stripeConfig.isConfigured();
    return {
      stripeEnabled: configured,
      publishableKey: this.stripeConfig.getPublishableKey(),
      plans: (["start", "pro", "elite"] as PlanId[]).map((id) => ({
        id,
        priceConfigured: Boolean(this.stripeConfig.getPriceId(id)),
      })),
    };
  }

  async createCheckoutSession(user: AuthUser, planIdInput?: string) {
    if (!user.tenantId) {
      throw new BadRequestException("No organization linked to this account");
    }

    const stripe = await this.stripeConfig.createClient();
    if (!stripe) {
      throw new ServiceUnavailableException(
        "Stripe is not configured. Add STRIPE_SECRET_KEY on the server or enable Stripe in Integrations.",
      );
    }

    const planId = this.stripeConfig.normalizePlanId(planIdInput);
    const priceId = this.stripeConfig.getPriceId(planId);
    if (!priceId) {
      throw new BadRequestException(
        `Stripe price not configured for plan "${planId}". Set STRIPE_PRICE_${planId.toUpperCase()} on the server.`,
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (!tenant) throw new NotFoundException("Organization not found");

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { email: true, fullName: true },
    });

    const customerEmail = dbUser?.email || user.email;
    const frontend = this.stripeConfig.getFrontendUrl();
    const planMeta = PLANS[planId];

    let customerId = tenant.stripeCustomerId || undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: tenant.name,
        metadata: { tenantId: tenant.id },
      });
      customerId = customer.id;
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId: customerId, billingEmail: customerEmail },
      });
    }

    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: { tenantId: tenant.id, planId },
    };

    if (
      tenant.subscriptionStatus === "trial" &&
      tenant.trialEndsAt &&
      tenant.trialEndsAt.getTime() > Date.now()
    ) {
      subscriptionData.trial_end = Math.floor(tenant.trialEndsAt.getTime() / 1000);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: tenant.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontend}/app/plans?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/app/plans?checkout=cancel`,
      metadata: {
        tenantId: tenant.id,
        planId,
        userId: user.sub,
      },
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    if (!session.url) {
      throw new ServiceUnavailableException("Could not create Stripe checkout session");
    }

    return { url: session.url, sessionId: session.id, planId, planName: planMeta.name };
  }

  async changePlan(user: AuthUser, planIdInput?: string) {
    if (!user.tenantId) {
      throw new BadRequestException("No organization linked to this account");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (!tenant) throw new NotFoundException("Organization not found");

    const planId = this.stripeConfig.normalizePlanId(planIdInput);
    if (tenant.planId === planId && tenant.stripeSubscriptionId && tenant.subscriptionStatus === "active") {
      throw new BadRequestException("You are already on this plan");
    }

    if (!tenant.stripeSubscriptionId) {
      return {
        ...(await this.createCheckoutSession(user, planId)),
        mode: "checkout" as const,
      };
    }

    const stripe = await this.stripeConfig.createClient();
    const priceId = this.stripeConfig.getPriceId(planId);
    if (!stripe || !priceId) {
      throw new ServiceUnavailableException("Stripe is not configured for this plan");
    }

    let subscription: Stripe.Subscription;
    try {
      subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
    } catch {
      return {
        ...(await this.createCheckoutSession(user, planId)),
        mode: "checkout" as const,
      };
    }

    if (["canceled", "incomplete_expired"].includes(subscription.status)) {
      return {
        ...(await this.createCheckoutSession(user, planId)),
        mode: "checkout" as const,
      };
    }

    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      throw new BadRequestException("Stripe subscription has no billable item");
    }

    const rank = { start: 0, pro: 1, elite: 2 } as const;
    const currentRank = rank[this.stripeConfig.normalizePlanId(tenant.planId)];
    const nextRank = rank[planId];
    const isUpgrade = nextRank >= currentRank;

    const updated = await stripe.subscriptions.update(subscription.id, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: isUpgrade ? "create_prorations" : "none",
      metadata: { tenantId: tenant.id, planId },
    });

    const periodEndUnix =
      (updated as Stripe.Subscription & { current_period_end?: number }).current_period_end ??
      updated.items.data[0]?.current_period_end;
    const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : tenant.currentPeriodEnd;

    await this.applyActiveSubscription(tenant.id, {
      planId,
      stripeCustomerId: tenant.stripeCustomerId,
      stripeSubscriptionId: updated.id,
      currentPeriodEnd,
      billingEmail: tenant.billingEmail,
      subscriptionStatus: updated.status === "trialing" ? "trial" : "active",
      notifyActivation: false,
    });

    return {
      mode: "updated" as const,
      planId,
      planName: PLANS[planId].name,
      upgrade: isUpgrade,
    };
  }

  async createPortalSession(user: AuthUser) {
    if (!user.tenantId) {
      throw new BadRequestException("No organization linked to this account");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { stripeCustomerId: true },
    });
    if (!tenant?.stripeCustomerId) {
      throw new BadRequestException("Add a payment method first to manage billing in Stripe.");
    }

    const stripe = await this.stripeConfig.createClient();
    if (!stripe) {
      throw new ServiceUnavailableException("Stripe is not configured");
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: tenant.stripeCustomerId,
        return_url: `${this.stripeConfig.getFrontendUrl()}/app/plans`,
      });
      if (!session.url) {
        throw new ServiceUnavailableException("Could not open the billing portal");
      }
      return { url: session.url };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Billing portal is not available";
      throw new ServiceUnavailableException(
        /portal|configuration/i.test(message)
          ? "Activate the Stripe Customer Portal in Stripe Settings → Billing → Customer portal, then try again."
          : message,
      );
    }
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    const stripe = await this.stripeConfig.createClient();
    const webhookSecret = this.stripeConfig.getWebhookSecret();
    if (!stripe || !webhookSecret) {
      throw new ServiceUnavailableException("Stripe webhook is not configured");
    }
    if (!signature) {
      throw new BadRequestException("Missing Stripe signature");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : "invalid"}`,
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.onCheckoutCompleted(stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_succeeded":
        await this.onInvoicePaid(stripe, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await this.syncSubscription(stripe, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async onCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
    if (session.mode === "payment" && session.metadata?.kind === "care_invoice") {
      const invoiceId = session.metadata.invoiceId || session.client_reference_id;
      if (
        invoiceId &&
        (session.payment_status === "paid" || session.status === "complete")
      ) {
        await this.prisma.invoice.updateMany({
          where: { id: invoiceId, NOT: { status: "PAID" } },
          data: {
            status: "PAID",
            paidAt: new Date(),
            stripeCheckoutSessionId: session.id,
          },
        });
      }
      return;
    }

    const tenantId = session.metadata?.tenantId || session.client_reference_id;
    const planId = this.stripeConfig.normalizePlanId(session.metadata?.planId);
    if (!tenantId) return;

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);
      const subscriptionStatus = sub.status === "trialing" ? "trial" : "active";
      await this.applyActiveSubscription(tenantId, {
        planId,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : session.customer?.id || null,
        stripeSubscriptionId: subscriptionId,
        currentPeriodEnd,
        billingEmail: session.customer_details?.email || session.customer_email || null,
        subscriptionStatus,
      });
    }
  }

  private async onInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;
    if (!subscriptionId) return;

    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });
    if (!tenant) return;

    const planMeta = PLANS[this.stripeConfig.normalizePlanId(tenant.planId)];
    const amount = invoice.amount_paid
      ? `$${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency?.toUpperCase() || "AUD"}`
      : planMeta.priceLabel;

    const customerEmail =
      typeof invoice.customer === "object" &&
      invoice.customer !== null &&
      "email" in invoice.customer
        ? invoice.customer.email
        : null;

    const email =
      tenant.billingEmail ||
      invoice.customer_email ||
      customerEmail ||
      null;

    if (email) {
      await this.email.sendPaymentReceipt({
        to: email,
        organizationName: tenant.name,
        planName: planMeta.name,
        amountPaid: amount,
        invoiceUrl: invoice.hosted_invoice_url,
      });
    }
  }

  private async syncSubscription(stripe: Stripe, subscription: Stripe.Subscription) {
    const tenantId = subscription.metadata?.tenantId;
    const tenant = tenantId
      ? await this.prisma.tenant.findUnique({ where: { id: tenantId } })
      : await this.prisma.tenant.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

    if (!tenant) return;

    const planId = this.stripeConfig.normalizePlanId(
      subscription.metadata?.planId || tenant.planId,
    );
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    if (subscription.status === "active" || subscription.status === "trialing") {
      await this.applyActiveSubscription(tenant.id, {
        planId,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id || tenant.stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd,
        billingEmail: tenant.billingEmail,
        subscriptionStatus: subscription.status === "trialing" ? "trial" : "active",
      });
      return;
    }

    if (subscription.status === "past_due" || subscription.status === "unpaid") {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionStatus: "past_due",
          currentPeriodEnd,
        },
      });
      return;
    }

    if (subscription.status === "canceled") {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionStatus: "cancelled",
          stripeSubscriptionId: null,
          currentPeriodEnd,
        },
      });
    }
  }

  private async applyActiveSubscription(
    tenantId: string,
    data: {
      planId: PlanId;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      currentPeriodEnd?: Date | null;
      billingEmail?: string | null;
      subscriptionStatus?: string;
      notifyActivation?: boolean;
    },
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        planId: data.planId,
        subscriptionStatus: data.subscriptionStatus || "active",
        stripeCustomerId: data.stripeCustomerId ?? undefined,
        stripeSubscriptionId: data.stripeSubscriptionId ?? undefined,
        currentPeriodEnd: data.currentPeriodEnd ?? undefined,
        billingEmail: data.billingEmail ?? undefined,
      },
    });

    const planMeta = PLANS[data.planId];
    const email = data.billingEmail || tenant.billingEmail;
    if (email && data.subscriptionStatus !== "trial" && data.notifyActivation !== false) {
      await this.email.sendSubscriptionActivated({
        to: email,
        organizationName: tenant.name,
        planName: planMeta.name,
        amountLabel: planMeta.priceLabel,
        periodEnd: data.currentPeriodEnd?.toISOString().slice(0, 10) ?? null,
      });
    }
  }
}
