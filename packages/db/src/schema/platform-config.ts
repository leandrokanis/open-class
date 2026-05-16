import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const platformConfig = pgTable('platform_config', {
  key:         varchar('key', { length: 100 }).primaryKey(),
  value:       text('value').notNull().default(''),
  label:       varchar('label', { length: 255 }),
  description: text('description'),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PlatformConfig    = typeof platformConfig.$inferSelect;
export type NewPlatformConfig = typeof platformConfig.$inferInsert;
