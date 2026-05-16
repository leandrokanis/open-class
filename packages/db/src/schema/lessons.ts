import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { modules } from './modules';

export const lessons = pgTable(
  'lessons',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    moduleId:        uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    title:           varchar('title', { length: 255 }).notNull(),
    description:     text('description'),
    youtubeUrl:      text('youtube_url').notNull(),
    youtubeVideoId:  varchar('youtube_video_id', { length: 11 }).notNull(),
    durationSeconds: integer('duration_seconds'),
    position:        integer('position').notNull(),
    isVisible:       boolean('is_visible').notNull().default(true),
    createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_lessons_module_position').on(table.moduleId, table.position)],
);

export type Lesson    = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
