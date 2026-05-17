import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    name:        varchar('name', { length: 100 }).notNull().unique(),
    slug:        varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    iconUrl:     text('icon_url'),
    position:    integer('position').notNull().default(0),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_categories_position').on(table.position)],
);

export type Category    = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
