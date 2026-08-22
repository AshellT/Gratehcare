import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { BillingStatus } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { TenantCrudService } from "@/common/services/tenant-crud.service";
import { AuthUser } from "@/common/types/auth-user.type";
import { PaginationDto } from "@/common/dto/pagination.dto";
import { toMoney } from "@/common/utils/money";
import { StripeConfigService } from "@/modules/subscription-billing/stripe-config.service";
import Stripe from "stripe";

type InvoiceRow = {
  id: string;
  tenantId: string;
  clientId: string | null;
  number: string;
  amount: unknown;
  currency?: string | null;
  status: string;
  issuedAt: Date | null;
  dueAt: Date | null;
  paidAt: Date | null;
  stripeCheckoutSessionId?: string | null;
  client?: { id?: string; fullName: string; funding?: string | null } | null;
};

type SerializedInvoice = {
  id: string;
  tenantId: string;
  clientId: string | null;
  number: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: Date | null;
  dueAt: Date | null;
  paidAt: Date | null;
  clientName: string;
  client?: { id?: string; fullName: string; funding?: string | null } | null;
  stripeCheckoutSessionId?: string | null;
};

@Injectable()
export class BillingService extends TenantCrudService {
  constructor(
    prisma: PrismaService,
    private readonly stripeConfig: StripeConfigService,
  ) {
    super(prisma, "invoice", {
      createData: (dto, tenantId) => {
        const clientId = String(dto.metadata?.clientId || "").trim() || undefined;
        const dueDays = Number(dto.metadata?.dueDays) || 14;
        return {
          tenantId,
          clientId,
          number: dto.title,
          amount: toMoney(dto.metadata?.amount),
          currency: String(dto.metadata?.currency || "AUD").toUpperCase(),
          status: "DRAFT",
          issuedAt: new Date(),
          dueAt: new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000),
        };
      },
      updateData: (dto) => ({
        number: dto.title,
        amount: dto.metadata?.amount != null ? toMoney(dto.metadata.amount) : undefined,
        clientId: String(dto.metadata?.clientId || "").trim() || undefined,
      }),
      archiveData: { status: "VOID" },
    });
  }

  serializeInvoice(invoice: InvoiceRow): SerializedInvoice {
    const status = this.effectiveStatus(invoice);
    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      clientId: invoice.clientId,
      number: invoice.number,
      invoiceNumber: invoice.number,
      amount: toMoney(invoice.amount),
      currency: String(invoice.currency || "AUD"),
      status,
      issuedAt: invoice.issuedAt,
      dueAt: invoice.dueAt,
      paidAt: invoice.paidAt ?? null,
      clientName: invoice.client?.fullName ?? "—",
      client: invoice.client ?? null,
      stripeCheckoutSessionId: invoice.stripeCheckoutSessionId ?? null,
    };
  }

  private effectiveStatus(invoice: { status?: string; dueAt?: Date | string | null }) {
    const status = String(invoice.status || "DRAFT").toUpperCase();
    if (status === "SENT" && invoice.dueAt && new Date(invoice.dueAt).getTime() < Date.now()) {
      return "OVERDUE";
    }
    return status;
  }

  override async list(query: PaginationDto, user: AuthUser) {
    const page = query.page || 1;
    const limit = query.limit || 100;
    const status = query.status?.trim();
    const where = await this.scopedWhere(user, {
      ...(status && status.toUpperCase() !== "OVERDUE"
        ? { status: status.toUpperCase() as BillingStatus }
        : {}),
    });
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { issuedAt: "desc" },
        include: { client: { select: { fullName: true } } },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    const serialized = items.map((item) => this.serializeInvoice(item));
    const filtered =
      status?.toUpperCase() === "OVERDUE"
        ? serialized.filter((item) => item.status === "OVERDUE")
        : serialized;
    return { items: filtered, total: status?.toUpperCase() === "OVERDUE" ? filtered.length : total, page, limit };
  }

  override async get(id: string, user: AuthUser) {
    const where = await this.scopedWhere(user, { id });
    const item = await this.prisma.invoice.findFirst({
      where,
      include: { client: { select: { fullName: true } } },
    });
    if (!item) {
      throw new NotFoundException("invoice not found");
    }
    return this.serializeInvoice(item);
  }

  override async create(dto: Parameters<TenantCrudService["create"]>[0], user: AuthUser) {
    const created = await super.create(dto, user);
    return this.get(created.id, user);
  }

  async markPaid(id: string, user: AuthUser) {
    await super.get(id, user);
    await this.prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });
    return this.get(id, user);
  }

  async sendInvoice(id: string, user: AuthUser) {
    await super.get(id, user);
    await this.prisma.invoice.update({
      where: { id },
      data: { status: "SENT", issuedAt: new Date() },
    });
    return this.get(id, user);
  }

  async stripeStatus() {
    const paymentsEnabled = await this.stripeConfig.isPaymentsConfigured();
    return {
      paymentsEnabled,
      waiting: !paymentsEnabled,
      publishableKey: this.stripeConfig.getPublishableKey(),
    };
  }

  async overview(user: AuthUser) {
    const invoiceWhere = await this.scopedWhere(user);
    const claimWhere = await this.scopedWhere(user, {}, "claim");
    const [invoices, claims, clients] = await Promise.all([
      this.prisma.invoice.findMany({
        where: invoiceWhere,
        include: { client: { select: { id: true, fullName: true, funding: true, status: true } } },
      }),
      this.prisma.claim.findMany({
        where: claimWhere,
        include: { client: { select: { id: true, fullName: true, funding: true } } },
      }),
      this.prisma.client.findMany({
        where: await this.scopedWhere(user, {}, "client"),
        select: { id: true, fullName: true, funding: true, status: true, createdAt: true },
      }),
    ]);

    const serializedInvoices = invoices.map((invoice) => this.serializeInvoice(invoice));
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const ageing = { current: 0, days30: 0, days60: 0, days90: 0 };

    for (const invoice of serializedInvoices) {
      if (["PAID", "VOID", "CANCELLED"].includes(String(invoice.status).toUpperCase())) continue;
      const due = invoice.dueAt ? new Date(invoice.dueAt).getTime() : now;
      const age = now - due;
      const amount = invoice.amount;
      if (age <= 0) ageing.current += amount;
      else if (age <= 30 * day) ageing.days30 += amount;
      else if (age <= 60 * day) ageing.days60 += amount;
      else ageing.days90 += amount;
    }

    const collected = serializedInvoices
      .filter((invoice) => String(invoice.status).toUpperCase() === "PAID")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = serializedInvoices
      .filter((invoice) => invoice.status === "OVERDUE")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const receivable = serializedInvoices
      .filter((invoice) => ["DRAFT", "SENT", "OVERDUE", "DISPUTED"].includes(String(invoice.status).toUpperCase()))
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const claimAmount = (claim: { amount: unknown; status: string }) => toMoney(claim.amount);
    const claimsPaid = claims
      .filter((claim) => claim.status === "PAID")
      .reduce((sum, claim) => sum + claimAmount(claim), 0);
    const claimsPipeline = claims
      .filter((claim) => ["SUBMITTED", "REVIEW", "APPROVED"].includes(claim.status))
      .reduce((sum, claim) => sum + claimAmount(claim), 0);

    const payerMap = new Map<string, { payer: string; amount: number; count: number }>();
    for (const claim of claims) {
      const payer = claim.payer || "Unassigned";
      const current = payerMap.get(payer) || { payer, amount: 0, count: 0 };
      current.amount += claimAmount(claim);
      current.count += 1;
      payerMap.set(payer, current);
    }
    for (const invoice of serializedInvoices) {
      const payer = invoice.client?.funding || "Private";
      const current = payerMap.get(payer) || { payer, amount: 0, count: 0 };
      current.amount += invoice.amount;
      current.count += 1;
      payerMap.set(payer, current);
    }

    const funding = clients.map((client) => {
      const billed = serializedInvoices
        .filter((invoice) => invoice.clientId === client.id)
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const claimed = claims
        .filter((claim) => claim.clientId === client.id)
        .reduce((sum, claim) => sum + claimAmount(claim), 0);
      const outstanding = serializedInvoices
        .filter(
          (invoice) =>
            invoice.clientId === client.id &&
            ["DRAFT", "SENT", "OVERDUE", "DISPUTED"].includes(String(invoice.status).toUpperCase()),
        )
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      return {
        clientId: client.id,
        clientName: client.fullName,
        funding: client.funding || "—",
        billed,
        claimed,
        outstanding,
        status: client.status === "REVIEW" || outstanding > billed * 0.8 ? "low-funds" : "allocated",
        since: client.createdAt,
      };
    });

    return {
      stripe: await this.stripeStatus(),
      stats: {
        receivable,
        collected,
        overdue,
        openInvoices: serializedInvoices.filter((invoice) =>
          ["DRAFT", "SENT", "OVERDUE", "DISPUTED"].includes(String(invoice.status).toUpperCase()),
        ).length,
        claimsPipeline,
        claimsPaid,
        openClaims: claims.filter((claim) => !["PAID", "REJECTED"].includes(claim.status)).length,
        revenue: collected + claimsPaid,
      },
      ageing,
      byPayer: [...payerMap.values()].sort((a, b) => b.amount - a.amount),
      funding,
    };
  }

  async createPaymentCheckout(id: string, user: AuthUser) {
    const invoice = await this.get(id, user);
    const status = String(invoice.status).toUpperCase();
    if (status === "PAID") {
      throw new BadRequestException("Invoice is already paid");
    }
    if (status === "VOID" || status === "CANCELLED") {
      throw new BadRequestException("Cannot collect payment for a void invoice");
    }

    const stripe = await this.stripeConfig.createClient();
    if (!stripe) {
      throw new ServiceUnavailableException({
        code: "STRIPE_NOT_CONFIGURED",
        message:
          "Stripe is waiting for keys. Add STRIPE_SECRET_KEY on the server to start collecting card payments.",
      });
    }

    const amountCents = Math.round(toMoney(invoice.amount) * 100);
    if (amountCents < 50) {
      throw new BadRequestException("Invoice amount is too small to charge with Stripe");
    }

    const frontend = this.stripeConfig.getFrontendUrl();
    const currency = String(invoice.currency || "aud").toLowerCase();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: invoice.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: `Invoice ${invoice.invoiceNumber || invoice.number}`,
              description: invoice.clientName ? `Care services for ${invoice.clientName}` : "Care services",
            },
          },
        },
      ],
      success_url: `${frontend}/app/payments?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/app/payments?checkout=cancel`,
      metadata: {
        kind: "care_invoice",
        invoiceId: invoice.id,
        tenantId: user.tenantId || "",
      },
    });

    if (!session.url) {
      throw new ServiceUnavailableException("Could not create Stripe checkout session");
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return { url: session.url, sessionId: session.id, waiting: false };
  }

  async confirmCheckout(sessionId: string, user?: AuthUser) {
    const stripe = await this.stripeConfig.createClient();
    if (!stripe) {
      throw new ServiceUnavailableException({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is waiting for keys.",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.kind !== "care_invoice") {
      throw new BadRequestException("Not a care invoice payment");
    }
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return { paid: false, status: session.payment_status };
    }

    const invoiceId = session.metadata.invoiceId || session.client_reference_id;
    if (!invoiceId) throw new BadRequestException("Missing invoice on Stripe session");

    if (user) {
      await super.get(invoiceId, user);
    }

    return this.markInvoicePaidFromStripe(invoiceId, session.id);
  }

  async markInvoicePaidFromStripe(invoiceId: string, sessionId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return { paid: false };
    if (invoice.status === "PAID") {
      return { paid: true, invoiceId, alreadyPaid: true };
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripeCheckoutSessionId: sessionId,
      },
    });
    return { paid: true, invoiceId };
  }
}
