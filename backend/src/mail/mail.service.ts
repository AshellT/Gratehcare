import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(params: { to: string; subject: string; html: string }) {
    const resendKey = this.config.get<string>("RESEND_API_KEY")?.trim();
    if (resendKey) {
      await this.sendWithResend(resendKey, params);
      return;
    }

    const host = this.config.get<string>("SMTP_HOST")?.trim();
    if (host) {
      await this.sendWithSmtp(host, params);
      return;
    }

    this.logger.warn(`Email skipped (no RESEND_API_KEY or SMTP_HOST): ${params.subject} → ${params.to}`);
  }

  private fromAddress() {
    return (
      this.config.get<string>("MAIL_FROM")?.trim() ||
      this.config.get<string>("BILLING_FROM_EMAIL")?.trim() ||
      "GRATEHCARE <noreply@localhost>"
    );
  }

  private async sendWithResend(
    apiKey: string,
    params: { to: string; subject: string; html: string },
  ) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Resend failed ${res.status}: ${body}`);
    }
  }

  private async sendWithSmtp(
    host: string,
    params: { to: string; subject: string; html: string },
  ) {
    const port = Number(this.config.get<string>("SMTP_PORT") || 465);
    const user = this.config.get<string>("SMTP_USER")?.trim();
    const pass = this.config.get<string>("SMTP_PASS")?.trim();
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
    await transporter.sendMail({
      from: this.fromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  }
}
