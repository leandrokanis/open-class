import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { McpOAuthRepository } from './mcp-oauth.repository';

const BCRYPT_ROUNDS = 10;
const AUTH_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface RegisterClientDto {
  client_name: string;
  redirect_uris: string[];
  grant_types?: string[];
  scope?: string;
}

export interface ExchangeCodeDto {
  grant_type: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
}

export interface TokenResult {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

@Injectable()
export class McpOAuthService {
  constructor(private readonly repo: McpOAuthRepository) {}

  async registerClient(dto: RegisterClientDto) {
    if (!dto.redirect_uris || dto.redirect_uris.length === 0) {
      throw new BadRequestException('redirect_uris must not be empty');
    }

    const clientId = randomUUID();
    const clientSecret = randomUUID();
    const clientSecretHash = await bcrypt.hash(clientSecret, BCRYPT_ROUNDS);

    await this.repo.createClient({
      clientId,
      clientSecretHash,
      clientName: dto.client_name,
      redirectUris: dto.redirect_uris,
      grantTypes: dto.grant_types ?? ['authorization_code'],
      scope: dto.scope ?? 'mcp',
    });

    return {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: dto.client_name,
      redirect_uris: dto.redirect_uris,
      grant_types: dto.grant_types ?? ['authorization_code'],
      scope: dto.scope ?? 'mcp',
    };
  }

  async createAuthorizationCode(
    clientId: string,
    redirectUri: string,
    userId: string,
    scope: string,
  ): Promise<string> {
    const client = await this.repo.findClientByClientId(clientId);
    if (!client) {
      throw new UnauthorizedException('invalid_client');
    }

    const registeredUris: string[] = client.redirectUris as string[];
    if (!registeredUris.includes(redirectUri)) {
      throw new BadRequestException('invalid_redirect_uri');
    }

    const code = randomUUID();
    const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS);

    await this.repo.createAuthCode({ code, clientId, userId, redirectUri, scope, expiresAt });

    return code;
  }

  async exchangeCodeForToken(dto: ExchangeCodeDto): Promise<TokenResult> {
    const client = await this.repo.findClientByClientId(dto.client_id);
    if (!client) {
      throw new UnauthorizedException('invalid_client');
    }

    const secretValid = await bcrypt.compare(dto.client_secret, client.clientSecretHash);
    if (!secretValid) {
      throw new UnauthorizedException('invalid_client');
    }

    const authCode = await this.repo.findAuthCode(dto.code);
    if (!authCode) {
      throw new UnauthorizedException('invalid_grant');
    }
    if (authCode.usedAt !== null) {
      throw new UnauthorizedException('invalid_grant');
    }
    if (authCode.expiresAt < new Date()) {
      throw new UnauthorizedException('invalid_grant');
    }

    await this.repo.markAuthCodeUsed(authCode.id);

    const ttlSeconds = parseInt(process.env.OAUTH_TOKEN_TTL ?? '3600', 10);
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.repo.createAccessToken({
      token,
      clientId: dto.client_id,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt,
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: ttlSeconds,
      scope: authCode.scope,
    };
  }

  async getClientInfo(clientId: string) {
    return this.repo.findClientByClientId(clientId);
  }

  async validateAccessToken(token: string): Promise<boolean> {
    const record = await this.repo.findAccessToken(token);
    if (!record) return false;
    return record.expiresAt > new Date();
  }
}
