import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ConflictException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

const makeUsersRepo = (overrides = {}) => ({
  findByEmail: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(null),
  findByGoogleId: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockImplementation((d) =>
    Promise.resolve({ id: 'user-1', role: 'aluno', isActive: true, ...d }),
  ),
  createPasswordResetToken: vi.fn().mockResolvedValue({ id: 'token-1' }),
  findValidPasswordResetToken: vi.fn().mockResolvedValue(null),
  updatePasswordHash: vi.fn().mockResolvedValue(undefined),
  markPasswordResetTokenUsed: vi.fn().mockResolvedValue(undefined),
  linkGoogleId: vi.fn().mockImplementation((id) => Promise.resolve({ id, isActive: true })),
  ...overrides,
});

const makeJwt = () => ({ sign: vi.fn().mockReturnValue('jwt-token') });
const makeMail = () => ({
  sendPasswordReset: vi.fn().mockResolvedValue(undefined),
  sendPasswordChanged: vi.fn().mockResolvedValue(undefined),
});
const makeRes = () => ({ cookie: vi.fn() } as never);
const makeConfig = () => ({ jwtSecret: 'secret', jwtExpiresIn: '1d' });

const buildService = (repoOverrides = {}) => {
  const repo = makeUsersRepo(repoOverrides);
  const jwt = makeJwt();
  const mail = makeMail();
  const service = new AuthService(repo as never, jwt as never, mail as never, makeConfig());
  return { service, repo, jwt, mail };
};

describe('AuthService', () => {
  describe('register', () => {
    it('creates user with hashed password and issues token', async () => {
      const { service, repo, jwt } = buildService();
      const res = makeRes();

      const result = await service.register(
        { name: 'Alice', email: 'alice@test.com', password: 'secret123' },
        res,
      );

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'alice@test.com' }),
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'jwt-token', expect.any(Object));
      expect(result.email).toBe('alice@test.com');
    });

    it('hashes password before saving', async () => {
      const { service, repo } = buildService();
      await service.register(
        { name: 'Alice', email: 'alice@test.com', password: 'secret123' },
        makeRes(),
      );

      const saved = repo.create.mock.calls[0][0];
      expect(saved.passwordHash).not.toBe('secret123');
      const valid = await bcrypt.compare('secret123', saved.passwordHash);
      expect(valid).toBe(true);
    });

    it('throws ConflictException when email already registered', async () => {
      const { service } = buildService({
        findByEmail: vi.fn().mockResolvedValue({ id: 'existing' }),
      });

      await expect(
        service.register({ name: 'Alice', email: 'alice@test.com', password: 'x' }, makeRes()),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ForbiddenException when ALLOW_REGISTRATION=false', async () => {
      process.env.ALLOW_REGISTRATION = 'false';
      const { service } = buildService();

      await expect(
        service.register({ name: 'A', email: 'a@test.com', password: 'x' }, makeRes()),
      ).rejects.toThrow(ForbiddenException);

      delete process.env.ALLOW_REGISTRATION;
    });
  });

  describe('validateUser', () => {
    it('returns user for valid credentials', async () => {
      const hash = await bcrypt.hash('correct', 10);
      const { service } = buildService({
        findByEmail: vi.fn().mockResolvedValue({
          id: 'u1', email: 'a@b.com', passwordHash: hash, isActive: true,
        }),
      });

      const result = await service.validateUser('a@b.com', 'correct');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('u1');
    });

    it('returns null for unknown email', async () => {
      const { service } = buildService({ findByEmail: vi.fn().mockResolvedValue(null) });
      expect(await service.validateUser('x@x.com', 'pass')).toBeNull();
    });

    it('returns null for wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      const { service } = buildService({
        findByEmail: vi.fn().mockResolvedValue({ id: 'u1', passwordHash: hash, isActive: true }),
      });

      expect(await service.validateUser('a@b.com', 'wrong')).toBeNull();
    });

    it('throws ForbiddenException for inactive account', async () => {
      const hash = await bcrypt.hash('pass', 10);
      const { service } = buildService({
        findByEmail: vi.fn().mockResolvedValue({
          id: 'u1', passwordHash: hash, isActive: false,
        }),
      });

      await expect(service.validateUser('a@b.com', 'pass')).rejects.toThrow(ForbiddenException);
    });

    it('returns null when user has no passwordHash (Google-only account)', async () => {
      const { service } = buildService({
        findByEmail: vi.fn().mockResolvedValue({ id: 'u1', passwordHash: null, isActive: true }),
      });

      expect(await service.validateUser('a@b.com', 'pass')).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('generates token and sends reset email for known address', async () => {
      const { service, repo, mail } = buildService({
        findByEmail: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
      });

      await service.forgotPassword('a@b.com');

      expect(repo.createPasswordResetToken).toHaveBeenCalledWith(
        'u1',
        expect.any(String),
        expect.any(Date),
      );
      expect(mail.sendPasswordReset).toHaveBeenCalledWith(
        'a@b.com',
        expect.stringContaining('reset-password'),
        undefined,
      );
    });

    it('does nothing for unknown email (no exception)', async () => {
      const { service, mail } = buildService({ findByEmail: vi.fn().mockResolvedValue(null) });

      await expect(service.forgotPassword('unknown@test.com')).resolves.toBeUndefined();
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates password and marks token used for valid token', async () => {
      const { service, repo } = buildService({
        findValidPasswordResetToken: vi.fn().mockResolvedValue({ id: 'token-1', userId: 'u1' }),
      });

      await service.resetPassword('raw-token', 'newPassword123');

      expect(repo.updatePasswordHash).toHaveBeenCalledWith('u1', expect.any(String));
      expect(repo.markPasswordResetTokenUsed).toHaveBeenCalledWith('token-1');

      const newHash = repo.updatePasswordHash.mock.calls[0][1];
      expect(await bcrypt.compare('newPassword123', newHash)).toBe(true);
    });

    it('throws BadRequestException for invalid or expired token', async () => {
      const { service } = buildService({
        findValidPasswordResetToken: vi.fn().mockResolvedValue(null),
      });

      await expect(service.resetPassword('bad-token', 'pass')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOrCreateGoogleUser', () => {
    const profile = (overrides = {}) => ({
      id: 'google-123',
      displayName: 'Alice',
      emails: [{ value: 'alice@gmail.com' }],
      photos: [{ value: 'https://photo.url' }],
      ...overrides,
    });

    it('returns existing user found by googleId', async () => {
      const existing = { id: 'u1', isActive: true };
      const { service } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue(existing),
      });

      const result = await service.findOrCreateGoogleUser(profile() as never);
      expect(result).toBe(existing);
    });

    it('links googleId to existing email account', async () => {
      const existing = { id: 'u1', isActive: true };
      const { service, repo } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue(null),
        findByEmail: vi.fn().mockResolvedValue(existing),
      });

      await service.findOrCreateGoogleUser(profile() as never);
      expect(repo.linkGoogleId).toHaveBeenCalledWith('u1', 'google-123', 'https://photo.url');
    });

    it('creates new user when email not registered', async () => {
      const { service, repo } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue(null),
        findByEmail: vi.fn().mockResolvedValue(null),
      });

      await service.findOrCreateGoogleUser(profile() as never);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'alice@gmail.com', googleId: 'google-123' }),
      );
    });

    it('throws ForbiddenException for inactive google account', async () => {
      const { service } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue({ id: 'u1', isActive: false }),
      });

      await expect(service.findOrCreateGoogleUser(profile() as never)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws UnauthorizedException when Google returns no email', async () => {
      const { service } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOrCreateGoogleUser(profile({ emails: [] }) as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when registration disabled and new Google user', async () => {
      process.env.ALLOW_REGISTRATION = 'false';
      const { service } = buildService({
        findByGoogleId: vi.fn().mockResolvedValue(null),
        findByEmail: vi.fn().mockResolvedValue(null),
      });

      await expect(service.findOrCreateGoogleUser(profile() as never)).rejects.toThrow(
        ForbiddenException,
      );
      delete process.env.ALLOW_REGISTRATION;
    });
  });

  describe('changePassword()', () => {
    it('should update password hash and send confirmation email for account with local password', async () => {
      const hash = await bcrypt.hash('oldpass123', 10);
      const { service, repo, mail } = buildService({
        findById: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@test.com',
          passwordHash: hash,
        }),
      });

      await service.changePassword('user-1', { currentPassword: 'oldpass123', newPassword: 'newpass456' });

      expect(repo.updatePasswordHash).toHaveBeenCalledWith('user-1', expect.any(String));
      const newHash = (repo.updatePasswordHash as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const valid = await bcrypt.compare('newpass456', newHash);
      expect(valid).toBe(true);
      expect(mail.sendPasswordChanged).toHaveBeenCalledWith('user@test.com', undefined);
    });

    it('should throw and not update hash or send email when currentPassword is wrong', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      const { service, repo, mail } = buildService({
        findById: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@test.com',
          passwordHash: hash,
        }),
      });

      await expect(
        service.changePassword('user-1', { currentPassword: 'wrongpass', newPassword: 'newpass456' }),
      ).rejects.toThrow();

      expect(repo.updatePasswordHash).not.toHaveBeenCalled();
      expect(mail.sendPasswordChanged).not.toHaveBeenCalled();
    });

    it('should set password for Google-only account without requiring currentPassword', async () => {
      const { service, repo, mail } = buildService({
        findById: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@test.com',
          passwordHash: null,
        }),
      });

      await service.changePassword('user-1', { newPassword: 'newpass456' });

      expect(repo.updatePasswordHash).toHaveBeenCalledWith('user-1', expect.any(String));
      expect(mail.sendPasswordChanged).toHaveBeenCalledWith('user@test.com', undefined);
    });

    it('should throw BadRequestException when currentPassword is missing for account with local password', async () => {
      const hash = await bcrypt.hash('existingpass', 10);
      const { service } = buildService({
        findById: vi.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@test.com',
          passwordHash: hash,
        }),
      });

      await expect(
        service.changePassword('user-1', { newPassword: 'newpass456' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
