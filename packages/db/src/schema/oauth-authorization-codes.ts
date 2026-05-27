import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const oauthAuthorizationCodes = pgTable('oauth_authorization_codes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  code:        varchar('code', { length: 128 }).notNull().unique(),
  clientId:    varchar('client_id', { length: 128 }).notNull(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  redirectUri: text('redirect_uri').notNull(),
  scope:       varchar('scope', { length: 255 }).notNull(),
  expiresAt:   timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt:      timestamp('used_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OauthAuthorizationCode = typeof oauthAuthorizationCodes.$inferSelect;
export type NewOauthAuthorizationCode = typeof oauthAuthorizationCodes.$inferInsert;
