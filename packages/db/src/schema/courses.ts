import { pgTable, uuid, varchar, text, timestamp, pgEnum, index, decimal, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { categories } from './categories';

export const courseStatusEnum = pgEnum('course_status_enum', ['draft', 'published']);
export const levelEnum        = pgEnum('level_enum', ['beginner', 'intermediate', 'advanced']);

export const courses = pgTable(
  'courses',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    instructorId:     uuid('instructor_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    categoryId:       uuid('category_id').references(() => categories.id, { onDelete: 'restrict' }),
    title:            varchar('title', { length: 255 }).notNull(),
    slug:             varchar('slug', { length: 255 }).notNull().unique(),
    shortDescription: varchar('short_description', { length: 200 }),
    description:      text('description'),
    level:            levelEnum('level'),
    status:           courseStatusEnum('status').notNull().default('draft'),
    thumbnailUrl:     text('thumbnail_url'),
    rating:           decimal('rating', { precision: 3, scale: 2 }),
    reviewCount:      integer('review_count').notNull().default(0),
    deletedAt:        timestamp('deleted_at', { withTimezone: true }),
    createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_courses_category').on(table.categoryId)],
);

export type Course       = typeof courses.$inferSelect;
export type NewCourse    = typeof courses.$inferInsert;
export type CourseStatus = 'draft' | 'published';
export type Level        = 'beginner' | 'intermediate' | 'advanced';
