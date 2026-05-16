import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lessons } from './lessons';

export const lessonResources = pgTable(
  'lesson_resources',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    lessonId:  uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    title:     varchar('title', { length: 255 }).notNull(),
    url:       text('url').notNull(),
    position:  integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_lesson_resources_lesson_position').on(table.lessonId, table.position)],
);

export const lessonResourcesRelations = relations(lessonResources, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonResources.lessonId], references: [lessons.id] }),
}));

// Defined here (not in lessons.ts) to avoid circular import
export const lessonsRelations = relations(lessons, ({ many }) => ({
  resources: many(lessonResources),
}));

export type LessonResource    = typeof lessonResources.$inferSelect;
export type NewLessonResource = typeof lessonResources.$inferInsert;
