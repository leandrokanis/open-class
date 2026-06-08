import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { MailService } from './mail.service';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
    })),
  },
  createTransport: vi.fn(() => ({
    sendMail: vi.fn(),
  })),
}));

const mockI18n = {
  translate: vi.fn().mockImplementation((key: string) => key),
};

describe('MailService', () => {
  let service: MailService;
  let sendMailMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const nodemailer = await import('nodemailer');
    sendMailMock = vi.fn();
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail: sendMailMock,
    } as any);

    const module = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    service = module.get(MailService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  // T005 — isConfigured()
  describe('isConfigured()', () => {
    it('should return true when SMTP_HOST is defined and non-empty', () => {
      process.env.SMTP_HOST = 'smtp.example.com';

      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when SMTP_HOST is absent', () => {
      delete process.env.SMTP_HOST;

      expect(service.isConfigured()).toBe(false);
    });

    it('should return false when SMTP_HOST is an empty string', () => {
      process.env.SMTP_HOST = '';

      expect(service.isConfigured()).toBe(false);
    });
  });

  // T006 — getStatus()
  describe('getStatus()', () => {
    it('should reflect env vars without exposing SMTP_PASS', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_FROM = 'noreply@example.com';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_PASS = 'secret';

      const status = service.getStatus();

      expect(status.host).toBe('smtp.example.com');
      expect(status.port).toBe(465);
      expect(status.from).toBe('noreply@example.com');
      expect(status.secure).toBe(true);
      expect(status.configured).toBe(true);
      expect(status.hasPassword).toBe(true);
      expect(JSON.stringify(status)).not.toContain('secret');
    });

    it('should return configured false and host null when SMTP_HOST is absent', () => {
      delete process.env.SMTP_HOST;

      const status = service.getStatus();

      expect(status.configured).toBe(false);
      expect(status.host).toBeNull();
    });

    it('should return hasPassword false when SMTP_PASS is absent', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      delete process.env.SMTP_PASS;

      const status = service.getStatus();

      expect(status.hasPassword).toBe(false);
    });

    it('should default secure to false when SMTP_SECURE is not set', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      delete process.env.SMTP_SECURE;

      const status = service.getStatus();

      expect(status.secure).toBe(false);
    });
  });

  // T007 — sendTestEmail()
  describe('sendTestEmail()', () => {
    it('should call sendMail once with SMTP_FROM as sender and correct recipient', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_FROM = 'noreply@example.com';
      sendMailMock.mockResolvedValue({});

      await service.sendTestEmail('admin@example.com');

      expect(sendMailMock).toHaveBeenCalledOnce();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'admin@example.com',
        }),
      );
    });

    it('should throw an explicit error when SMTP is not configured', async () => {
      delete process.env.SMTP_HOST;

      await expect(service.sendTestEmail('admin@example.com')).rejects.toThrow(
        /não configurado/i,
      );
      expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('should propagate transporter failure with a descriptive message', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_FROM = 'noreply@example.com';
      sendMailMock.mockRejectedValue(new Error('Connection refused'));

      await expect(service.sendTestEmail('admin@example.com')).rejects.toThrow(
        /Connection refused/i,
      );
    });
  });

  // T001 — sendEnrollmentWelcome()
  describe('sendEnrollmentWelcome()', () => {
    it('should call sendMail with course name in subject and link in body when SMTP is configured', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_FROM = 'noreply@example.com';
      sendMailMock.mockResolvedValue({});

      await service.sendEnrollmentWelcome('aluno@example.com', 'Curso de NestJS', 'http://localhost:41700/courses/nestjs');

      expect(sendMailMock).toHaveBeenCalledOnce();
      const call = sendMailMock.mock.calls[0][0];
      expect(call.to).toBe('aluno@example.com');
      expect(call.from).toBe('noreply@example.com');
      expect(call.subject).toContain('Curso de NestJS');
      expect(call.html).toContain('http://localhost:41700/courses/nestjs');
    });

    it('should log warning and not call sendMail when SMTP is not configured', async () => {
      delete process.env.SMTP_HOST;

      await service.sendEnrollmentWelcome('aluno@example.com', 'Curso de NestJS', 'http://localhost:41700/courses/nestjs');

      expect(sendMailMock).not.toHaveBeenCalled();
    });
  });

  // T008 — sendPasswordReset() regression
  describe('sendPasswordReset() regression', () => {
    it('should use SMTP_FROM as sender', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_FROM = 'noreply@example.com';
      sendMailMock.mockResolvedValue({});

      await service.sendPasswordReset('user@example.com', 'https://example.com/reset');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'noreply@example.com' }),
      );
    });
  });

  // T038 — sendPasswordChanged()
  describe('sendPasswordChanged()', () => {
    it('should send email to the user when SMTP is configured', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_FROM = 'noreply@example.com';
      sendMailMock.mockResolvedValue({});

      await service.sendPasswordChanged('user@example.com');

      expect(sendMailMock).toHaveBeenCalledOnce();
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'user@example.com',
        }),
      );
    });

    it('should log warning and skip sending when SMTP is not configured', async () => {
      delete process.env.SMTP_HOST;

      await service.sendPasswordChanged('user@example.com');

      expect(sendMailMock).not.toHaveBeenCalled();
    });
  });
});
