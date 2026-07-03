import { pgTable, uuid, varchar, integer, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { modules } from './modules';

// Turma de um curso: período de inscrições, vagas e cronograma de liberação
// de módulos (Epic 7 — US-22). Status é derivado (closedAt/período), não persistido.
export const cohorts = pgTable(
  'cohorts',
  {
    id:              uuid('id').primaryKey().defaultRandom(),
    courseId:        uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    name:            varchar('name', { length: 255 }).notNull(),
    enrollmentStart: timestamp('enrollment_start', { withTimezone: true }).notNull(),
    enrollmentEnd:   timestamp('enrollment_end', { withTimezone: true }).notNull(),
    seats:           integer('seats').notNull(),
    closedAt:        timestamp('closed_at', { withTimezone: true }),
    createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_cohorts_course').on(table.courseId)],
);

export const cohortModuleSchedules = pgTable(
  'cohort_module_schedules',
  {
    cohortId:      uuid('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
    moduleId:      uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    availableFrom: timestamp('available_from', { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.cohortId, table.moduleId] })],
);

export type Cohort               = typeof cohorts.$inferSelect;
export type NewCohort            = typeof cohorts.$inferInsert;
export type CohortModuleSchedule = typeof cohortModuleSchedules.$inferSelect;
