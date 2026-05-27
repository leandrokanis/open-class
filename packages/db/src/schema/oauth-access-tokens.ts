import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const oauthAccessTokens = pgTable('oauth_access_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  token:     varchar('token', { length: 512 }).notNull().unique(),
  clientId:  varchar('client_id', { length: 128 }).notNull(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  scope:     varchar('scope', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OauthAccessToken = typeof oauthAccessTokens.$inferSelect;
export type NewOauthAccessToken = typeof oauthAccessTokens.$inferInsert;
