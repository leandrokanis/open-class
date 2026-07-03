import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { modules } from './modules';

// Celebração de desbloqueio de aulas extras: registrada uma única vez por
// módulo por aluno (US-20). O desbloqueio em si é computado do progresso.
export const extraUnlockCelebrations = pgTable(
  'extra_unlock_celebrations',
  {
    studentId:    uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    moduleId:     uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    celebratedAt: timestamp('celebrated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.studentId, table.moduleId] })],
);

export type ExtraUnlockCelebration    = typeof extraUnlockCelebrations.$inferSelect;
export type NewExtraUnlockCelebration = typeof extraUnlockCelebrations.$inferInsert;
