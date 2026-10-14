import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: parseInt(process.env.SMTP_PORT ?? '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? `"Restaurant SaaS" <noreply@restaurant.local>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
    }
  }

  async sendWelcomeEmail(params: {
    to: string;
    restaurantName: string;
    ownerName: string;
    loginUrl: string;
    tempPassword: string;
    primaryColor?: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: ${params.primaryColor ?? '#FF6B35'};">Welcome to ${params.restaurantName}!</h2>
        <p>Hi ${params.ownerName},</p>
        <p>Your restaurant dashboard is ready.</p>
        <p><strong>Login URL:</strong> <a href="${params.loginUrl}">${params.loginUrl}</a></p>
        <p><strong>Temporary Password:</strong> <code>${params.tempPassword}</code></p>
        <p>Please change your password after logging in.</p>
      </div>
    `;
    await this.sendMail({
      to: params.to,
      subject: `Welcome to ${params.restaurantName}!`,
      html,
    });
  }

  async sendOrderConfirmation(
    to: string,
    orderNumber: string,
    restaurantName: string,
    totalAmount: number,
    currency: string,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `Order #${orderNumber} Confirmed - ${restaurantName}`,
      html: `
        <h2>Your order has been confirmed!</h2>
        <p>Order Number: <strong>${orderNumber}</strong></p>
        <p>Restaurant: ${restaurantName}</p>
        <p>Total: ${currency} ${totalAmount.toFixed(2)}</p>
      `,
    });
  }
}
