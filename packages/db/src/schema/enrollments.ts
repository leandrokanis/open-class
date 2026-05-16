import { pgTable, uuid, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

export const enrollmentStatusEnum = pgEnum('enrollment_status_enum', ['active', 'completed', 'cancelled']);

export const enrollments = pgTable(
  'enrollments',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    studentId:  uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId:   uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    status:     enrollmentStatusEnum('status').notNull().default('active'),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('uq_enrollments_student_course').on(table.studentId, table.courseId)],
);

export type Enrollment       = typeof enrollments.$inferSelect;
export type NewEnrollment    = typeof enrollments.$inferInsert;
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';
