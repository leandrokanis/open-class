import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    if (!process.env.SMTP_HOST) {
      this.logger.warn(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_USER ?? 'noreply@open-class.app',
      to: email,
      subject: 'Redefinição de senha — Open Class',
      text: `Para redefinir sua senha acesse: ${resetUrl}\n\nEste link expira em 1 hora e é de uso único.`,
      html: `<p>Para redefinir sua senha <a href="${resetUrl}">clique aqui</a>.</p><p>Este link expira em 1 hora e é de uso único.</p>`,
    });
  }
}
