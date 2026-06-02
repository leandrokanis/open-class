import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface MailConfigStatus {
  host: string | null;
  port: number;
  from: string | null;
  secure: boolean;
  configured: boolean;
  hasPassword: boolean;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  isConfigured(): boolean {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_HOST.trim());
  }

  getStatus(): MailConfigStatus {
    const configured = this.isConfigured();
    return {
      host: process.env.SMTP_HOST || null,
      port: Number(process.env.SMTP_PORT ?? 587),
      from: process.env.SMTP_FROM || null,
      secure: process.env.SMTP_SECURE === 'true',
      configured,
      hasPassword: Boolean(process.env.SMTP_PASS),
    };
  }

  async sendTestEmail(to: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('SMTP não configurado. Defina SMTP_HOST nas variáveis de ambiente.');
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Teste de configuração — Open Class',
      text: 'Este é um e-mail de teste para validar a configuração SMTP da plataforma Open Class.',
      html: '<p>Este é um e-mail de teste para validar a configuração SMTP da plataforma Open Class.</p>',
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Redefinição de senha — Open Class',
      text: `Para redefinir sua senha acesse: ${resetUrl}\n\nEste link expira em 1 hora e é de uso único.`,
      html: `<p>Para redefinir sua senha <a href="${resetUrl}">clique aqui</a>.</p><p>Este link expira em 1 hora e é de uso único.</p>`,
    });
  }
}
