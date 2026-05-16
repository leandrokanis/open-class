import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['aluno', 'instrutor', 'admin']);

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  name:         varchar('name', { length: 255 }).notNull(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role:         roleEnum('role').notNull().default('aluno'),
  avatarUrl:    text('avatar_url'),
  bio:          varchar('bio', { length: 300 }),
  googleId:     varchar('google_id', { length: 255 }).unique(),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
