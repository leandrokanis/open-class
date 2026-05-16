import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { modules, visibilityEnum } from './modules';

export const contentTypeEnum = pgEnum('content_type_enum', ['video', 'text', 'quiz']);

export const lessons = pgTable(
  'lessons',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    moduleId:       uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    title:          varchar('title', { length: 255 }).notNull(),
    contentType:    contentTypeEnum('content_type').notNull().default('video'),
    youtubeUrl:     text('youtube_url'),
    youtubeVideoId: varchar('youtube_video_id', { length: 11 }),
    description:    text('description'),
    duration:       integer('duration_seconds'),
    resources:      jsonb('resources').$type<Array<{ label: string; url: string }>>(),
    position:       integer('position').notNull(),
    visibility:     visibilityEnum('visibility').notNull().default('visible'),
    createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_lessons_module_position').on(table.moduleId, table.position)],
);

export type Lesson    = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
