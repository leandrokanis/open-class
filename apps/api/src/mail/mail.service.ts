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

  async sendEnrollmentWelcome(email: string, courseName: string, courseUrl: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn(`[DEV] Enrollment welcome for ${email}: ${courseUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Bem-vindo ao curso: ${courseName}`,
      text: `Sua matrícula no curso "${courseName}" foi confirmada. Acesse: ${courseUrl}`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#18181b;padding:32px 40px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Open Class</p>
        </td></tr>
        <tr><td style="padding:40px 40px 32px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b">Matrícula confirmada!</h1>
          <p style="margin:0 0 6px;font-size:15px;color:#52525b;line-height:1.6">Você está matriculado em:</p>
          <p style="margin:0 0 24px;font-size:17px;font-weight:600;color:#18181b">${courseName}</p>
          <a href="${courseUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 28px;border-radius:8px">Acessar curso</a>
          <p style="margin:28px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6">Se o botão não funcionar, acesse:<br>
            <a href="${courseUrl}" style="color:#52525b;word-break:break-all">${courseUrl}</a>
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #f4f4f5">
          <p style="margin:0;font-size:12px;color:#a1a1aa">Bons estudos! Se tiver dúvidas, fale com a equipe Open Class.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
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
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <!-- header -->
        <tr><td style="background:#18181b;padding:32px 40px">
          <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Open Class</p>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:40px 40px 32px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b">Redefinição de senha</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 28px;border-radius:8px">Redefinir senha</a>
          <p style="margin:28px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6">Se o botão não funcionar, copie e cole o link abaixo no navegador:<br>
            <a href="${resetUrl}" style="color:#52525b;word-break:break-all">${resetUrl}</a>
          </p>
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #f4f4f5">
          <p style="margin:0;font-size:12px;color:#a1a1aa">Este link expira em <strong>1 hora</strong> e é de uso único. Se você não solicitou a redefinição, ignore este e-mail.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }
}
