import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { lessons } from './lessons';
import { cohorts } from './cohorts';

// Vínculo de aula exclusiva a turmas (many-to-many): uma aula pode ser exclusiva
// de várias turmas ao mesmo tempo (US-25 estendida). Aula sem nenhum vínculo é
// regular; com vínculos, só é visível/acessível aos alunos das turmas ligadas.
export const lessonCohorts = pgTable(
  'lesson_cohorts',
  {
    lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    cohortId: uuid('cohort_id').notNull().references(() => cohorts.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.lessonId, table.cohortId] }),
    index('idx_lesson_cohorts_cohort').on(table.cohortId),
  ],
);

export type LessonCohort    = typeof lessonCohorts.$inferSelect;
export type NewLessonCohort = typeof lessonCohorts.$inferInsert;
