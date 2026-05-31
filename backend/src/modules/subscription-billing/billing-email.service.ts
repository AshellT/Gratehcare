import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BillingEmailService {
  private readonly logger = new Logger(BillingEmailService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey() {
    return this.config.get<string>("RESEND_API_KEY")?.trim() || null;
  }

  private get fromAddress() {
    return (
      this.config.get<string>("BILLING_FROM_EMAIL")?.trim() ||
      "GRATEHCARE Billing <billing@gratehcare.care>"
    );
  }

  async sendSubscriptionActivated(params: {
    to: string;
    organizationName: string;
    planName: string;
    amountLabel: string;
    periodEnd?: string | null;
  }) {
    const subject = `Your GRATEHCARE ${params.planName} subscription is active`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h1 style="font-size:22px;margin-bottom:8px">Subscription confirmed</h1>
        <p>Hi there,</p>
        <p>
          <strong>${params.organizationName}</strong> is now subscribed to
          <strong>${params.planName}</strong> on GRATEHCARE.
        </p>
        <p style="background:#f8fafc;border-radius:12px;padding:16px">
          Plan: <strong>${params.planName}</strong><br/>
          Amount: <strong>${params.amountLabel}</strong><br/>
          ${params.periodEnd ? `Next billing date: <strong>${params.periodEnd}</strong>` : ""}
        </p>
        <p>You can manage billing anytime from <strong>Settings → Subscription</strong> in your workspace.</p>
        <p style="color:#64748b;font-size:13px">Thank you for choosing GRATEHCARE.</p>
      </div>
    `;

    await this.send({ to: params.to, subject, html });
  }

  async sendPaymentReceipt(params: {
    to: string;
    organizationName: string;
    planName: string;
    amountPaid: string;
    invoiceUrl?: string | null;
  }) {
    const subject = `GRATEHCARE payment receipt — ${params.amountPaid}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <h1 style="font-size:22px;margin-bottom:8px">Payment received</h1>
        <p>We received your payment for <strong>${params.organizationName}</strong>.</p>
        <p style="background:#f8fafc;border-radius:12px;padding:16px">
          Plan: <strong>${params.planName}</strong><br/>
          Amount paid: <strong>${params.amountPaid}</strong>
        </p>
        ${
          params.invoiceUrl
            ? `<p><a href="${params.invoiceUrl}">View invoice in Stripe</a></p>`
            : ""
        }
        <p style="color:#64748b;font-size:13px">This is your billing receipt from GRATEHCARE.</p>
      </div>
    `;

    await this.send({ to: params.to, subject, html });
  }

  private async send(params: { to: string; subject: string; html: string }) {
    const apiKey = this.apiKey;
    if (!apiKey) {
      this.logger.warn(`Email skipped (RESEND_API_KEY not set): ${params.subject} → ${params.to}`);
      return;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Resend failed (${res.status}): ${body}`);
      }
    } catch (error) {
      this.logger.error(`Email send error: ${error instanceof Error ? error.message : error}`);
    }
  }
}
