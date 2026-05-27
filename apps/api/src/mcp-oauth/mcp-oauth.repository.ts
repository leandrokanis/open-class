import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  oauthClients,
  oauthAuthorizationCodes,
  oauthAccessTokens,
  type NewOauthClient,
  type NewOauthAuthorizationCode,
  type NewOauthAccessToken,
} from '@open-class/db';
import type { Db } from '../db';

@Injectable()
export class McpOAuthRepository {
  constructor(@Inject('DATABASE') private readonly db: Db) {}

  findClientByClientId(clientId: string) {
    return this.db.query.oauthClients.findFirst({
      where: eq(oauthClients.clientId, clientId),
    });
  }

  async createClient(data: NewOauthClient) {
    const [client] = await this.db.insert(oauthClients).values(data).returning();
    return client;
  }

  async createAuthCode(data: NewOauthAuthorizationCode) {
    const [code] = await this.db.insert(oauthAuthorizationCodes).values(data).returning();
    return code;
  }

  findAuthCode(code: string) {
    return this.db.query.oauthAuthorizationCodes.findFirst({
      where: eq(oauthAuthorizationCodes.code, code),
    });
  }

  async markAuthCodeUsed(id: string) {
    await this.db
      .update(oauthAuthorizationCodes)
      .set({ usedAt: new Date() })
      .where(eq(oauthAuthorizationCodes.id, id));
  }

  async createAccessToken(data: NewOauthAccessToken) {
    const [token] = await this.db.insert(oauthAccessTokens).values(data).returning();
    return token;
  }

  findAccessToken(token: string) {
    return this.db.query.oauthAccessTokens.findFirst({
      where: eq(oauthAccessTokens.token, token),
    });
  }
}
