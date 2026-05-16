import { pgTable, uuid, varchar, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { modules } from './modules';

export const contentTypeEnum = pgEnum('content_type_enum', ['video', 'text', 'quiz']);

export const lessons = pgTable(
  'lessons',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    moduleId:    uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    title:       varchar('title', { length: 255 }).notNull(),
    contentType: contentTypeEnum('content_type').notNull(),
    duration:    integer('duration'),
    position:    integer('position').notNull(),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_lessons_module_position').on(table.moduleId, table.position)],
);

export type Lesson      = typeof lessons.$inferSelect;
export type NewLesson   = typeof lessons.$inferInsert;
export type ContentType = 'video' | 'text' | 'quiz';
