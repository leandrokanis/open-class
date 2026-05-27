import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const oauthClients = pgTable('oauth_clients', {
  id:               uuid('id').primaryKey().defaultRandom(),
  clientId:         varchar('client_id', { length: 128 }).notNull().unique(),
  clientSecretHash: varchar('client_secret_hash', { length: 255 }).notNull(),
  clientName:       varchar('client_name', { length: 255 }).notNull(),
  redirectUris:     jsonb('redirect_uris').notNull().$type<string[]>(),
  grantTypes:              jsonb('grant_types').notNull().$type<string[]>().default(['authorization_code']),
  scope:                   varchar('scope', { length: 255 }).notNull().default('mcp'),
  tokenEndpointAuthMethod: varchar('token_endpoint_auth_method', { length: 50 }).notNull().default('client_secret_basic'),
  createdAt:               timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OauthClient = typeof oauthClients.$inferSelect;
export type NewOauthClient = typeof oauthClients.$inferInsert;
