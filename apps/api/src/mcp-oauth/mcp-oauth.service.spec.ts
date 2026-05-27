import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { McpOAuthService } from './mcp-oauth.service';
import { McpOAuthRepository } from './mcp-oauth.repository';

const makeMockRepo = () => ({
  findClientByClientId: vi.fn(),
  createClient: vi.fn(),
  createAuthCode: vi.fn(),
  findAuthCode: vi.fn(),
  markAuthCodeUsed: vi.fn(),
  createAccessToken: vi.fn(),
  findAccessToken: vi.fn(),
});

describe('McpOAuthService', () => {
  let service: McpOAuthService;
  let repo: ReturnType<typeof makeMockRepo>;

  beforeEach(async () => {
    repo = makeMockRepo();
    const module = await Test.createTestingModule({
      providers: [
        McpOAuthService,
        { provide: McpOAuthRepository, useValue: repo },
      ],
    }).compile();
    service = module.get(McpOAuthService);
  });

  // ─── registerClient ───────────────────────────────────────────────────────

  describe('registerClient()', () => {
    it('should create client and return client_id + plaintext client_secret', async () => {
      // Arrange
      repo.createClient.mockResolvedValue({});
      const dto = { client_name: 'claude.ai', redirect_uris: ['https://claude.ai/callback'] };

      // Act
      const result = await service.registerClient(dto);

      // Assert
      expect(result.client_id).toBeTruthy();
      expect(result.client_secret).toBeTruthy();
      expect(repo.createClient).toHaveBeenCalledOnce();
      const callArg = repo.createClient.mock.calls[0][0];
      expect(callArg.clientId).toBe(result.client_id);
      expect(callArg.clientSecretHash).not.toBe(result.client_secret); // hash ≠ plaintext
    });

    it('should throw BadRequestException when redirect_uris is empty', async () => {
      // Arrange
      const dto = { client_name: 'test', redirect_uris: [] };

      // Act & Assert
      await expect(service.registerClient(dto)).rejects.toThrow(BadRequestException);
      expect(repo.createClient).not.toHaveBeenCalled();
    });
  });

  // ─── createAuthorizationCode ──────────────────────────────────────────────

  describe('createAuthorizationCode()', () => {
    it('should create and return a code when client and redirectUri are valid', async () => {
      // Arrange
      repo.findClientByClientId.mockResolvedValue({
        clientId: 'cid',
        redirectUris: ['https://claude.ai/callback'],
        scope: 'mcp',
      });
      repo.createAuthCode.mockResolvedValue({ code: 'generated-code' });

      // Act
      const code = await service.createAuthorizationCode(
        'cid',
        'https://claude.ai/callback',
        'user-uuid',
        'mcp',
      );

      // Assert
      expect(code).toBeTruthy();
      expect(repo.createAuthCode).toHaveBeenCalledOnce();
      const arg = repo.createAuthCode.mock.calls[0][0];
      expect(arg.clientId).toBe('cid');
      expect(arg.userId).toBe('user-uuid');
      expect(arg.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw BadRequestException when redirectUri is not registered for client', async () => {
      // Arrange
      repo.findClientByClientId.mockResolvedValue({
        clientId: 'cid',
        redirectUris: ['https://other.example.com/cb'],
        scope: 'mcp',
      });

      // Act & Assert
      await expect(
        service.createAuthorizationCode('cid', 'https://evil.example.com/cb', 'user-uuid', 'mcp'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when client does not exist', async () => {
      // Arrange
      repo.findClientByClientId.mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        service.createAuthorizationCode('nonexistent', 'https://example.com/cb', 'uid', 'mcp'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── exchangeCodeForToken ─────────────────────────────────────────────────

  describe('exchangeCodeForToken()', () => {
    const futureDate = new Date(Date.now() + 60_000);
    const pastDate = new Date(Date.now() - 60_000);

    it('should exchange a valid code for an access token', async () => {
      // Arrange
      const fakeClient = { clientId: 'cid', clientSecretHash: '', redirectUris: [] };
      repo.findClientByClientId.mockResolvedValue(fakeClient);
      repo.findAuthCode.mockResolvedValue({
        id: 'code-id',
        code: 'valid-code',
        clientId: 'cid',
        redirectUri: 'https://claude.ai/callback',
        scope: 'mcp',
        expiresAt: futureDate,
        usedAt: null,
      });
      repo.markAuthCodeUsed.mockResolvedValue(undefined);
      repo.createAccessToken.mockResolvedValue({ token: 'new-token' });

      // We need to mock bcrypt compare — patch the service's internal call
      // by using a real bcrypt hash so compare passes
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('secret', 1);
      fakeClient.clientSecretHash = hash;

      // Act
      const result = await service.exchangeCodeForToken({
        grant_type: 'authorization_code',
        code: 'valid-code',
        redirect_uri: 'https://claude.ai/callback',
        client_id: 'cid',
        client_secret: 'secret',
      });

      // Assert
      expect(result.access_token).toBeTruthy();
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBeGreaterThan(0);
      expect(repo.markAuthCodeUsed).toHaveBeenCalledWith('code-id');
    });

    it('should throw UnauthorizedException for already used code', async () => {
      // Arrange
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('secret', 1);
      repo.findClientByClientId.mockResolvedValue({ clientId: 'cid', clientSecretHash: hash });
      repo.findAuthCode.mockResolvedValue({
        id: 'code-id',
        code: 'used-code',
        clientId: 'cid',
        redirectUri: 'https://claude.ai/callback',
        scope: 'mcp',
        expiresAt: futureDate,
        usedAt: new Date(),
      });

      // Act & Assert
      await expect(
        service.exchangeCodeForToken({
          grant_type: 'authorization_code',
          code: 'used-code',
          redirect_uri: 'https://claude.ai/callback',
          client_id: 'cid',
          client_secret: 'secret',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired code', async () => {
      // Arrange
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('secret', 1);
      repo.findClientByClientId.mockResolvedValue({ clientId: 'cid', clientSecretHash: hash });
      repo.findAuthCode.mockResolvedValue({
        id: 'code-id',
        code: 'expired-code',
        clientId: 'cid',
        redirectUri: 'https://claude.ai/callback',
        scope: 'mcp',
        expiresAt: pastDate,
        usedAt: null,
      });

      // Act & Assert
      await expect(
        service.exchangeCodeForToken({
          grant_type: 'authorization_code',
          code: 'expired-code',
          redirect_uri: 'https://claude.ai/callback',
          client_id: 'cid',
          client_secret: 'secret',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong client_secret', async () => {
      // Arrange
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.hash('correct-secret', 1);
      repo.findClientByClientId.mockResolvedValue({ clientId: 'cid', clientSecretHash: hash });
      repo.findAuthCode.mockResolvedValue({
        id: 'code-id',
        code: 'valid-code',
        clientId: 'cid',
        redirectUri: 'https://claude.ai/callback',
        scope: 'mcp',
        expiresAt: futureDate,
        usedAt: null,
      });

      // Act & Assert
      await expect(
        service.exchangeCodeForToken({
          grant_type: 'authorization_code',
          code: 'valid-code',
          redirect_uri: 'https://claude.ai/callback',
          client_id: 'cid',
          client_secret: 'wrong-secret',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── validateAccessToken ──────────────────────────────────────────────────

  describe('validateAccessToken()', () => {
    it('should return true for valid non-expired token', async () => {
      // Arrange
      repo.findAccessToken.mockResolvedValue({
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3_600_000),
      });

      // Act
      const result = await service.validateAccessToken('valid-token');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existent token', async () => {
      // Arrange
      repo.findAccessToken.mockResolvedValue(undefined);

      // Act
      const result = await service.validateAccessToken('no-such-token');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for expired token', async () => {
      // Arrange
      repo.findAccessToken.mockResolvedValue({
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1_000),
      });

      // Act
      const result = await service.validateAccessToken('expired-token');

      // Assert
      expect(result).toBe(false);
    });
  });
});
