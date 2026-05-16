import { pgTable, uuid, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lessons } from './lessons';

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    studentId:   uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId:    uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    isCompleted: boolean('is_completed').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_lesson_progress_student_lesson').on(table.studentId, table.lessonId),
    index('idx_lesson_progress_student').on(table.studentId),
    index('idx_lesson_progress_lesson').on(table.lessonId),
  ],
);

export type LessonProgress    = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;
