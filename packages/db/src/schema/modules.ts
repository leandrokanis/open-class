import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const modules = pgTable(
  'modules',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    courseId:    uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    title:       varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    position:    integer('position').notNull(),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_modules_course_position').on(table.courseId, table.position)],
);

export type Module    = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
