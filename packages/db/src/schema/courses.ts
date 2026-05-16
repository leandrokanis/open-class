import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const courseStatusEnum = pgEnum('course_status_enum', ['draft', 'published']);
export const levelEnum        = pgEnum('level_enum', ['beginner', 'intermediate', 'advanced']);

export const courses = pgTable('courses', {
  id:               uuid('id').primaryKey().defaultRandom(),
  instructorId:     uuid('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:            varchar('title', { length: 255 }).notNull(),
  slug:             varchar('slug', { length: 255 }).notNull().unique(),
  shortDescription: varchar('short_description', { length: 200 }),
  description:      text('description'),
  level:            levelEnum('level'),
  status:           courseStatusEnum('status').notNull().default('draft'),
  thumbnailUrl:     text('thumbnail_url'),
  deletedAt:        timestamp('deleted_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Course       = typeof courses.$inferSelect;
export type NewCourse    = typeof courses.$inferInsert;
export type CourseStatus = 'draft' | 'published';
export type Level        = 'beginner' | 'intermediate' | 'advanced';
